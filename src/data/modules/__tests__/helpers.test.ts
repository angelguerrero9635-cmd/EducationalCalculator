import { formatNumber } from '@/engine/format';

import { withWorkedFigures, workedFigures } from '../grade';
import { direction, wholeRatio } from '../helpers';

describe('wholeRatio', () => {
  it.each([
    [
      [0.5, 0.5],
      [1, 1],
    ],
    [
      [0.2, 0.3],
      [2, 3],
    ],
    [
      [1.0, 1.33],
      [3, 4],
    ],
    [
      [0.1, 0.25],
      [2, 5],
    ],
    [
      [2.0, 4.02, 6.01],
      [1, 2, 3],
    ],
  ])('%p → %p', (amounts, ratio) => {
    expect(wholeRatio(amounts)).toEqual(ratio);
  });
  it('gives up on a ratio no small multiplier makes whole', () => {
    expect(wholeRatio([1, 1.43])).toBeUndefined();
  });
});

describe('direction', () => {
  it.each([
    [3, 4, 53.13],
    [-3, 4, 126.87],
    [-3, -4, 233.13],
    [3, -4, 306.87],
    [0, 5, 90],
  ])('(%p, %p) points %p°', (x, y, deg) => {
    expect(direction(x, y)).toBeCloseTo(deg, 2);
  });
});

describe('worked figures (Grades 9–12 science show worked-out values as their pictures do)', () => {
  it('defaults to 3 on s.9–s.12 pages only, a page may set its own', () => {
    expect(workedFigures({ id: 's.11.modern-physics' })).toBe(3);
    expect(workedFigures({ id: 's.9.biomolecules~dehydration' })).toBe(3);
    expect(workedFigures({ id: 's.8.forces' })).toBeUndefined();
    expect(workedFigures({ id: 'm.12.vectors' })).toBeUndefined();
    expect(workedFigures({ id: 's.10.gas-laws', workedFigures: 4 })).toBe(4);
  });
  it.each([
    [1.9230769e-12, '1.92 × 10⁻¹²'],
    [1.5804e7 + 0.5, '1.58 × 10⁷'],
    [0.019035, '0.019'],
    [277.77, '278'],
    [12345.6, '12,300'],
    [12346, '12,346'],
    [2.5, '2.5'],
  ])('%p shows %p', (x, text) => {
    expect(formatNumber(x, withWorkedFigures({}, 3))).toBe(text);
  });
  it('leaves a value with its own display alone', () => {
    expect(withWorkedFigures({ integer: true }, 3)).toEqual({ integer: true });
    expect(withWorkedFigures({ figures: 4 }, 3)).toEqual({ figures: 4 });
    expect(withWorkedFigures({}, undefined)).toEqual({});
  });
});
