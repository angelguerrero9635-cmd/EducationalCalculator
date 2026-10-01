import {
  complexRoots,
  exactRoot,
  quadraticRoot,
  radical,
  radicalParts,
  surdOf,
  surdText,
} from '../exact';
import { formatNumber, parseNumber, renderTemplate } from '../format';
import type { VariableDef } from '../types';

describe('exact values (E22)', () => {
  it('simplifies a square root', () => {
    expect(radicalParts(124)).toEqual([2, 31]);
    expect(radicalParts(72)).toEqual([6, 2]);
    expect(radical(36)).toBe('6');
    expect(radical(124)).toBe('2√31');
    expect(radical(31)).toBe('√31');
  });

  it('finds k√n/q only when the value is one', () => {
    expect(surdText(surdOf(Math.sqrt(3) / 2)!)).toBe('√3/2');
    expect(surdText(surdOf(-Math.SQRT2 / 2)!)).toBe('−√2/2');
    expect(surdText(surdOf(3 * Math.SQRT2)!)).toBe('3√2');
    expect(surdText(surdOf(Math.sqrt(31) / 4)!)).toBe('√31/4');
    expect(surdText(surdOf(Math.sqrt(124) / 4)!)).toBe('√31/2');
    expect(surdOf(Math.sqrt(911) / 24)).toBeUndefined(); // a bottom past 12
    expect(surdText(surdOf(Math.sqrt(911) / 24, 40)!)).toBe('√911/24');
    // Not roots: a fraction, a whole number, a decimal with no root in it.
    expect(surdOf(0.5)).toBeUndefined();
    expect(surdOf(3)).toBeUndefined();
    expect(surdOf(Math.cos(1))).toBeUndefined();
    expect(surdOf(0.7071)).toBeUndefined();
  });

  it('knows the special-angle values', () => {
    const deg = Math.PI / 180;
    expect(exactRoot(Math.sin(45 * deg))).toBe('√2/2');
    expect(exactRoot(Math.cos(30 * deg))).toBe('√3/2');
    expect(exactRoot(Math.tan(30 * deg))).toBe('√3/3');
    expect(exactRoot(Math.sin(75 * deg))).toBe('(√6 + √2)/4');
    expect(exactRoot(Math.sin(15 * deg))).toBe('(√6 − √2)/4');
    expect(exactRoot(Math.sin(255 * deg))).toBe('−(√6 + √2)/4');
    expect(exactRoot(Math.tan(15 * deg))).toBe('2 − √3');
    expect(exactRoot(Math.sin(30 * deg))).toBeUndefined(); // 1/2: a fraction, not a root
    expect(exactRoot(Math.sin(1))).toBeUndefined();
  });

  it('writes a quadratic’s roots from its discriminant', () => {
    expect(quadraticRoot(2, 3, -2, 1)).toBe('1/2');
    expect(quadraticRoot(2, 3, -2, -1)).toBe('−2');
    expect(quadraticRoot(1, -2, -1, 1)).toBe('1 + √2');
    expect(quadraticRoot(1, -2, -1, -1)).toBe('1 − √2');
    expect(quadraticRoot(2, 3, -1, 1)).toBe('(−3 + √17)/4');
    expect(quadraticRoot(1, 0, -3, -1)).toBe('−√3');
    expect(quadraticRoot(4, 0, -3, 1)).toBe('√3/2');
    expect(quadraticRoot(1, 0, 1, 1)).toBeUndefined();
    expect(quadraticRoot(1.5, 0, -3, 1)).toBeUndefined();
    expect(complexRoots(1, -4, 13)).toBe('2 ± 3i');
    expect(complexRoots(1, 1, 1)).toBe('−1/2 ± (√3/2)i');
    expect(complexRoots(1, 0, 4)).toBe('±2i');
    expect(complexRoots(1, 0, 18)).toBe('±3i√2');
    expect(complexRoots(20, -4, 13)).toBe('1/10 ± 4/5 i');
    expect(complexRoots(1, -4, 3)).toBeUndefined();
  });

  it('shows an exact variable exactly, in boxes, lines and typed', () => {
    const v: Pick<VariableDef, 'exact' | 'fraction'> = { exact: true, fraction: 12 };
    expect(formatNumber(-Math.sqrt(3) / 2, v)).toBe('−√3/2');
    expect(formatNumber(0.5, v)).toBe('1/2');
    expect(formatNumber(Math.cos(1), v)).toBe('0.5403');
    // From the page's values when the value alone can't say.
    const root: Pick<VariableDef, 'exact'> = {
      exact: (vs) => quadraticRoot(vs.a!, vs.b!, vs.c!, 1),
    };
    const x = (-3 + Math.sqrt(17)) / 4;
    expect(formatNumber(x, { ...root, values: { a: 2, b: 3, c: -1 } })).toBe('(−3 + √17)/4');
    expect(formatNumber(x, root)).toBe('0.2808');
    // A sum is bracketed where it meets an operator; a root over a bottom after ÷.
    const vars: VariableDef[] = [
      { id: 'y', symbol: 'y', name: 'y', exact: true },
      { id: 'x', symbol: 'x', name: 'x', exact: true },
    ];
    expect(renderTemplate('{y} ÷ {x}', vars, { y: 0.5, x: -Math.sqrt(3) / 2 })).toBe(
      '0.5 ÷ (−√3/2)',
    );
    expect(renderTemplate('3 × {y}', vars, { y: 2 - Math.sqrt(3) })).toBe('3 × (2 − √3)');
    expect(parseNumber('√3/2')).toBeCloseTo(Math.sqrt(3) / 2, 12);
    expect(parseNumber('−3√2')).toBeCloseTo(-3 * Math.SQRT2, 12);
    expect(parseNumber('sqrt(2)/2')).toBeCloseTo(Math.SQRT1_2, 12);
  });
});
