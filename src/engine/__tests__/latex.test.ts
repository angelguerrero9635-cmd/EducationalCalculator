import { fromLatex, parseMath, splitLine, toLatex, withoutOuterBrackets } from '../latex';

const both = (plain: string, band: Parameters<typeof toLatex>[1], symbols: string[] = []) => {
  const tex = toLatex(plain, band, symbols);
  if (tex !== undefined) {
    expect(fromLatex(tex)).toBe(plain);
    expect(() => splitLine(tex)).not.toThrow();
  }
  return tex;
};

describe('toLatex', () => {
  it.each([
    ['2/3 × 3/4 = 6/12', '$\\frac{2}{3}$ × $\\frac{3}{4}$ = $\\frac{6}{12}$'],
    ['31/24 = 1 7/24', '$\\frac{31}{24}$ = $1\\frac{7}{24}$'],
    ['2/3 ÷ 3/4 = 8/?', '$\\frac{2}{3}$ ÷ $\\frac{3}{4}$ = $\\frac{8}{?}$'],
    ['10³ = 10 × 10 × 10 = 1,000', '${10}^{3}$ = 10 × 10 × 10 = 1,000'],
    ['½ × 6 × 3 = 9', '$\\half$ × 6 × 3 = 9'],
    ['1,200/144 = 8 1/3', '$\\frac{1,200}{144}$ = $8\\frac{1}{3}$'],
    // A fraction at the end of a sentence is found, and drawn small in the sentence.
    ['1 whole is 24/24.', '1 whole is $\\tfrac{24}{24}$.'],
  ])('elementary: %s', (plain, tex) => {
    expect(both(plain, 'elementary')).toBe(tex);
  });

  it('keeps units, clock times, points, remainders and K–2 as text', () => {
    for (const band of ['elementary', 'middle', 'standard'] as const) {
      for (const line of ['Area = 36 m²', '12 cm²', '60 km/h', '13 m/s', '3:45', '(−4, 3)']) {
        expect([band, line, toLatex(line, band, ['m', 'A'])]).toEqual([band, line, undefined]);
      }
    }
    expect(toLatex('10 ÷ 3 = 3, remainder 1', 'elementary')).toBeUndefined();
    expect(toLatex('10 ÷ 3 = 3, remainder 1', 'standard')).toBeUndefined();
    expect(toLatex('Every number from 45 to 54 rounds to 50.', 'elementary')).toBeUndefined();
    expect(toLatex('1/2 of the pizza', 'early')).toBeUndefined();
  });

  it('Grade 6 letter pages: italic letters, and solving lines stacked', () => {
    expect(both('x + 7 = 12', 'middle', ['x', 'p', 'q'])).toBe('$\\mathit{x}$ + 7 = 12');
    expect(both('4x ÷ 4 = 30 ÷ 4', 'middle', ['x', 'p', 'q'])).toBe(
      '$\\divfrac{4\\mathit{x}}{4}$ = $\\divfrac{30}{4}$',
    );
    // Other divisions keep ÷ on Grade 6 pages.
    expect(toLatex('e = 71 ÷ 2', 'middle', ['a'])).toBeUndefined();
    expect(both('(1 + 0.1)³', 'middle')).toBe('${(1 + 0.1)}^{3}$');
  });

  it('high school and college: ^ powers, stacked divisions, roots with powers inside', () => {
    expect(both('x^(n − 1)', 'standard')).toBe('$\\pow{x}{(n − 1)}$');
    expect(both('m = (8 − 2) ÷ (4 − 1)', 'standard')).toBe('m = $\\divfrac{(8 − 2)}{(4 − 1)}$');
    expect(both('c = √(3² + 4²)', 'standard')).toBe('c = $\\sqrt{({3}^{2} + {4}^{2})}$');
    expect(both('The growth factor is 1 + r/100.', 'standard')).toBe(
      'The growth factor is 1 + $\\tfrac{r}{100}$.',
    );
  });

  it('parses the commands it draws, and refuses others', () => {
    expect(splitLine('$\\frac{1}{2}$ of 8').map((p) => p.t)).toEqual(['math', 'text']);
    expect(parseMath('3 \\times 4 \\le 12')).toEqual([{ t: 'text', s: '3 × 4 ≤ 12' }]);
    expect(() => parseMath('\\integral{x}')).toThrow();
    expect(withoutOuterBrackets(parseMath('(8 − 2)'))).toEqual([{ t: 'text', s: '8 − 2' }]);
    expect(withoutOuterBrackets(parseMath('(a) + (b)'))).toEqual([{ t: 'text', s: '(a) + (b)' }]);
  });
});
