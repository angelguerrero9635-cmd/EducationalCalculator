import { formatNumber } from '../format';

describe('significant figures', () => {
  it.each([
    [2.5, 3, '2.50'],
    [3, 2, '3.0'],
    [0.045, 3, '0.0450'],
    [1234, 2, '1,200'],
    [0.9996, 3, '1.00'],
    [-12.345, 4, '−12.35'],
    [0.000012, 3, '1.20 × 10⁻⁵'],
    [25000000, 3, '2.50 × 10⁷'],
  ])('%p to %p figures is %p', (x, sig, text) => {
    expect(formatNumber(x, { sigFigs: sig })).toBe(text);
  });
});
