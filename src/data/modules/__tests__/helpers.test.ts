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
