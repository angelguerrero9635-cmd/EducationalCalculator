import {
  angleText,
  cAbs,
  cArgDeg,
  cDiv,
  cMul,
  complex,
  complexProductLines,
  complexQuotientLines,
  complexSumLines,
  complexText,
  conjugateLine,
  cPowInt,
  cSqrt,
  fromPolar,
  parseComplex,
  polarProductLines,
  polarQuotientLines,
  polarText,
  tidyComplex,
  toPolarLines,
  toRectangularLines,
} from '../complex';
import { exactShow } from '../linalg';

const J = { unit: 'j' as const };

describe('complex values (HE-E17)', () => {
  it('works the arithmetic', () => {
    expect(cMul(complex(2, 3), complex(1, -4))).toEqual(complex(14, -5));
    expect(cDiv(complex(30, 40), complex(1, -2))).toEqual(complex(-10, 20));
    expect(cDiv(complex(1), complex(0))).toBeUndefined();
    expect(tidyComplex(cPowInt(complex(0, 1), 3)!)).toEqual(complex(0, -1));
    expect(cSqrt(complex(-4))).toEqual(complex(0, 2));
    expect(cAbs(complex(8, 6))).toBe(10);
    expect(cArgDeg(complex(-1, 0))).toBe(180);
    expect(tidyComplex(fromPolar(10, 36.869897645844))).toEqual(complex(8, 6));
  });

  it('writes a value with i on math pages and j on electrical pages', () => {
    expect(complexText(complex(3, 4))).toBe('3 + 4i');
    expect(complexText(complex(3, -1))).toBe('3 − i');
    expect(complexText(complex(0, -4))).toBe('−4i');
    expect(complexText(complex(5, 0))).toBe('5');
    expect(complexText(complex(0, 0))).toBe('0');
    expect(complexText(complex(2.2, -0.4), { show: exactShow })).toBe('11/5 − 2/5 i');
    expect(complexText(complex(8, 6), J)).toBe('8 + j6');
    expect(complexText(complex(40, -30), J)).toBe('40 − j30');
    expect(complexText(complex(0, -6), J)).toBe('−j6');
    expect(complexText(complex(1, 1), J)).toBe('1 + j1');
    expect(complexText(complex(0.5, 0.25), { ...J, show: exactShow })).toBe('1/2 + j(1/4)');
    expect(polarText(complex(8, 6))).toBe('10∠36.87°');
    expect(polarText(complex(8, -6))).toBe('10∠−36.87°');
    expect(angleText(-0.001)).toBe('0°');
  });

  it('reads a typed value', () => {
    expect(parseComplex('8 + j6')).toEqual(complex(8, 6));
    expect(parseComplex('8 − j6')).toEqual(complex(8, -6));
    expect(parseComplex('3 - 4i')).toEqual(complex(3, -4));
    expect(parseComplex('8 - 6j')).toEqual(complex(8, -6));
    expect(parseComplex('-2.5i')).toEqual(complex(0, -2.5));
    expect(parseComplex('j')).toEqual(complex(0, 1));
    expect(parseComplex('5')).toEqual(complex(5));
    expect(parseComplex('10∠36.87°')!.re).toBeCloseTo(8, 3);
    expect(parseComplex('1,000 + j2')).toEqual(complex(1000, 2));
    for (const bad of ['', 'x', '3 + 4', '3 + 4k', 'j6j', '3 ++ 4i']) {
      expect([bad, parseComplex(bad)]).toEqual([bad, undefined]);
    }
  });

  it('writes the lines a class writes', () => {
    expect(complexSumLines(complex(3, 4), complex(1, -2), '+', J)).toEqual([
      '(3 + j4) + (1 − j2) = (3 + 1) + j(4 + (−2)) = 4 + j2',
    ]);
    expect(complexProductLines(complex(2, 3), complex(1, -4))).toEqual([
      '(2 + 3i)(1 − 4i) = 2 − 8i + 3i − 12i²',
      '= 2 + 12 − 5i',
      '= 14 − 5i',
    ]);
    expect(complexProductLines(complex(3, 4), complex(1, -2), J)[0]).toBe(
      '(3 + j4)(1 − j2) = 3 − j6 + j4 − j²8',
    );
    expect(complexQuotientLines(complex(30, 40), complex(1, -2), J)).toEqual([
      '(30 + j40) ÷ (1 − j2) = (30 + j40)(1 + j2) ÷ ((1 − j2)(1 + j2))',
      '= (−50 + j100) ÷ (1² + (−2)²)',
      '= (−50 + j100) ÷ 5',
      '= −10 + j20',
    ]);
    expect(complexQuotientLines(complex(1), complex(0))).toEqual([]);
    expect(polarProductLines(fromPolar(10, 30), fromPolar(2, 45), J)).toEqual([
      '10∠30° × 2∠45° = (10 × 2)∠(30° + 45°) = 20∠75°',
    ]);
    expect(polarQuotientLines(fromPolar(10, 30), fromPolar(2, 45))).toEqual([
      '10∠30° ÷ 2∠45° = (10 ÷ 2)∠(30° − 45°) = 5∠−15°',
    ]);
    expect(toPolarLines(complex(-8, 6), J)).toEqual([
      '|−8 + j6| = √((−8)² + 6²) = 10',
      'θ = ∠(−8 + j6) = tan⁻¹(6 ÷ (−8)) + 180° = 143.13°',
      '−8 + j6 = 10∠143.13°',
    ]);
    expect(toRectangularLines(10, 36.87, J)).toEqual([
      '10∠36.87° = 10 cos 36.87° + j10 sin 36.87°',
      '= 8 + j6',
    ]);
    expect(conjugateLine(complex(3, 4), J)).toBe('(3 + j4)* = 3 − j4');
  });
});
