import { invT, tCdf, tPdf, tStar } from '../statMath';

describe('the t distribution', () => {
  // Table values: t* for 95% with 9 df is 2.262; 99% with 20 df is 2.845; 90% with 30 df 1.697.
  it.each([
    [0.95, 9, 2.262],
    [0.99, 20, 2.845],
    [0.9, 30, 1.697],
    [0.95, 1, 12.706],
  ])('t* for %p with %p df is %p', (level, df, t) => {
    expect(tStar(level, df)).toBeCloseTo(t, 3);
  });

  it('is symmetric, with half its area below 0', () => {
    expect(tCdf(0, 7)).toBeCloseTo(0.5, 12);
    expect(tCdf(-1.5, 7) + tCdf(1.5, 7)).toBeCloseTo(1, 12);
    expect(tCdf(2.015, 5)).toBeCloseTo(0.95, 3);
  });

  it('inverts its cdf and nears the normal with many degrees of freedom', () => {
    expect(tCdf(invT(0.2, 12), 12)).toBeCloseTo(0.2, 9);
    expect(tPdf(0, 1000)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 3);
  });
});
