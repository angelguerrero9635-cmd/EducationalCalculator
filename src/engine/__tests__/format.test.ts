import {
  belowStep,
  engineering,
  figuresIn,
  formatNumber,
  keepNumbersWhole,
  logDecimals,
  parseNumber,
  renderTemplate,
  signedText,
} from '../format';

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

describe('college range and figures (HE-E10)', () => {
  it('shows and reads exponents far past ±30', () => {
    expect(formatNumber(1.5e37)).toBe('1.5 × 10³⁷');
    expect(formatNumber(1.616e-35)).toBe('1.616 × 10⁻³⁵');
    expect(formatNumber(6.62607e-34, { scientificFigures: 4 })).toBe('6.626 × 10⁻³⁴');
    expect(formatNumber(1.989e30, { sigFigs: 4 })).toBe('1.989 × 10³⁰');
    expect(formatNumber(2e31, { scientific: true, worked: 3 })).toBe('2.00 × 10³¹');
    expect(parseNumber('1.616 × 10⁻³⁵')).toBeCloseTo(1.616e-35, 45);
    expect(parseNumber('1.5 × 10^37')).toBe(1.5e37);
    expect(parseNumber('6.626e-34')).toBe(6.626e-34);
  });

  it('keeps a fixed count of decimals (a pH from its concentration’s figures)', () => {
    expect(formatNumber(2.6021, { decimals: 2 })).toBe('2.60');
    expect(formatNumber(7, { decimals: 2 })).toBe('7.00');
    expect(formatNumber(-0.001, { decimals: 2 })).toBe('0.00');
    expect(formatNumber(4.745, { decimals: 2 })).toBe('4.75');
    expect(formatNumber(12345.678, { decimals: 1 })).toBe('12,345.7');
    expect(figuresIn('0.0250')).toBe(3);
    expect(figuresIn('2.5 × 10⁻³')).toBe(2);
    expect(figuresIn('1,200')).toBe(2);
    expect(figuresIn('1200.')).toBe(4);
    expect(figuresIn('7')).toBe(1);
    expect(figuresIn('−4.50e3')).toBe(3);
    expect(figuresIn('pH')).toBeUndefined();
    expect(
      formatNumber(-Math.log10(2.5e-3), { decimals: logDecimals(figuresIn('2.5 × 10⁻³')!) }),
    ).toBe('2.60');
  });

  it('writes a sign on a charge or signed change: +3, −1, 0', () => {
    expect(signedText(3)).toBe('+3');
    expect(signedText(-1)).toBe('−1');
    expect(signedText(0)).toBe('0');
    expect(formatNumber(2, { integer: true, signed: true })).toBe('+2');
    expect(formatNumber(4.2e-6, { signed: true })).toBe('+4.2 × 10⁻⁶');
    const vars = [
      { id: 'a', symbol: 'a', name: 'a' },
      { id: 'q', symbol: 'q', name: 'q', signed: true },
    ];
    expect(renderTemplate('{a} − {q}', vars, { a: 2, q: 3 })).toBe('2 − (+3)');
    expect(renderTemplate('{q}', vars, { q: 3 })).toBe('+3');
  });

  it('engineering notation: exponents in threes', () => {
    expect(engineering(47000)).toBe('47 × 10³');
    expect(engineering(2.2e-9)).toBe('2.2 × 10⁻⁹');
    expect(engineering(3.3e-8)).toBe('33 × 10⁻⁹');
    expect(engineering(-150)).toBe('−150');
    expect(engineering(999.96, 4)).toBe('1 × 10³');
  });

  it('keeps scientific notation on one line when drawn', () => {
    expect(keepNumbersWhole('E = 6.626 × 10⁻³⁴ × 5 × 10¹⁴')).toBe(
      'E = 6.626\u00A0×\u00A010⁻³⁴ × 5\u00A0×\u00A010¹⁴',
    );
    expect(keepNumbersWhole('3 × 4 = 12')).toBe('3 × 4 = 12');
  });
});
