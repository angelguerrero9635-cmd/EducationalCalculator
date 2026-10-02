import { belowStep, formatNumber, parseNumber } from '../format';

describe('significant figures', () => {
  it.each([
    [2.5, 3, '2.50'],
    [3, 2, '3.0'],
    [0.045, 3, '0.0450'],
    [1234, 2, '1.2 × 10³'],
    [4.35, 2, '4.4'],
    [2500, 4, '2,500'],
    [0.9996, 3, '1.00'],
    [-12.345, 4, '−12.35'],
    [0.000012, 3, '1.20 × 10⁻⁵'],
    [25000000, 3, '2.50 × 10⁷'],
  ])('%p to %p figures is %p', (x, sig, text) => {
    expect(formatNumber(x, { sigFigs: sig })).toBe(text);
  });
});

describe('radians as fractions of π', () => {
  it.each([
    [(5 * Math.PI) / 2, '5π/2'],
    [Math.PI / 6, 'π/6'],
    [(-3 * Math.PI) / 4, '−3π/4'],
    [2 * Math.PI, '2π'],
    [Math.PI, 'π'],
  ])('%p is %p, and reads back', (x, text) => {
    expect(formatNumber(x, { pi: 'fraction' })).toBe(text);
    expect(parseNumber(text)).toBeCloseTo(x, 12);
  });
  it('keeps decimal multiples on pages that write them (2.25π)', () => {
    expect(formatNumber(2.25 * Math.PI, { pi: true })).toBe('2.25π');
    expect(parseNumber('3pi/4')).toBeCloseTo((3 * Math.PI) / 4, 12);
  });
});

describe('a worked-out value below its step', () => {
  it('reads "< step" instead of 0', () => {
    const P = { belowStep: true, step: 0.0001 };
    expect(belowStep(0.00002, formatNumber(0.00002), P)).toBe('< 0.0001');
    expect(belowStep(0, formatNumber(0), P)).toBe('< 0.0001');
    expect(belowStep(0.0312, formatNumber(0.0312), P)).toBe('0.0312');
    expect(belowStep(0, formatNumber(0), { step: 0.0001 })).toBe('0');
  });
});

describe('figures', () => {
  it('shows at most that many significant figures from 1 up', () => {
    expect(formatNumber(277.7778, { figures: 4 })).toBe('277.8');
    expect(formatNumber(3.60206, { figures: 4 })).toBe('3.602');
    expect(formatNumber(12345.678, { figures: 4 })).toBe('12,346');
    expect(formatNumber(2.5, { figures: 4 })).toBe('2.5');
    expect(formatNumber(0.0012347, { figures: 4 })).toBe('0.001235');
  });
});

describe('figures ties', () => {
  it('round a tie up, as by hand', () => {
    expect(formatNumber(8766 / 400, { figures: 4 })).toBe('21.92');
    expect(formatNumber(-8766 / 400, { figures: 4 })).toBe('−21.92');
  });
});

describe('ties below 1', () => {
  it('round up', () => {
    expect(formatNumber(0.019035)).toBe('0.01904');
    expect(formatNumber(2.00005)).toBe('2.0001');
  });
});

describe('scientific notation to the page’s figures', () => {
  it('shows a worked-out value to them, alone in scientific form', () => {
    expect(formatNumber(5930767.55, { scientific: true })).toBe('5.9308 × 10⁶');
    expect(formatNumber(5930767.55, { scientific: true, scientificFigures: 3 })).toBe('5.93 × 10⁶');
    // Under 10⁻⁴ the usual switch to scientific form takes them too; decimals keep theirs.
    expect(formatNumber(3.0302e-19, { scientificFigures: 3 })).toBe('3.03 × 10⁻¹⁹');
    expect(formatNumber(0.14384, { scientificFigures: 3 })).toBe('0.1438');
    // `worked` (a box's figures) wins.
    expect(formatNumber(3.0302e-19, { worked: 2, scientificFigures: 3 })).toBe('3.0 × 10⁻¹⁹');
    // The figures keep their zeros (1.9978 × 10⁵ to 3 is 2.00 × 10⁵); × 10⁰ is left out.
    expect(formatNumber(1.9978e5, { scientific: true, worked: 3 })).toBe('2.00 × 10⁵');
    expect(formatNumber(1.1e6, { scientific: true, worked: 3 })).toBe('1.10 × 10⁶');
    expect(formatNumber(1.2, { scientific: true })).toBe('1.2');
    expect(formatNumber(1.2, { scientific: true, worked: 3 })).toBe('1.20');
    expect(formatNumber(4.5e7 + 0.5)).toBe('4.5 × 10⁷');
  });
});

describe('a power of ten alone', () => {
  it('reads as 1 × 10ⁿ (a conversion factor: 1 C = 10⁶ μC)', () => {
    expect(parseNumber('10⁶')).toBe(1e6);
    expect(parseNumber('10^12')).toBe(1e12);
    expect(parseNumber('10⁻³')).toBeCloseTo(1e-3, 15);
    expect(parseNumber('10')).toBe(10);
  });
});
