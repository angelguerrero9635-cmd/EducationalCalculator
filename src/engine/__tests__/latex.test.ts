import { fromLatex, parseMath, splitLine, toLatex } from '../latex';

describe('toLatex', () => {
  it.each([
    ['2/3 × 3/4 = 6/12', '$\\frac{2}{3}$ × $\\frac{3}{4}$ = $\\frac{6}{12}$'],
    ['31/24 = 1 7/24', '$\\frac{31}{24}$ = $1\\frac{7}{24}$'],
    ['10³ = 10 × 10 × 10 = 1,000', '${10}^{3}$ = 10 × 10 × 10 = 1,000'],
    ['x² + 1', '${x}^{2}$ + 1'],
    ['√(A ÷ 6) = 4', '$\\left.\\sqrt{A ÷ 6}$ = 4'],
    ['½ × 6 × 3 = 9', '$\\tfrac{1}{2}$ × 6 × 3 = 9'],
    ['2/3 ÷ 3/4 = 8/?', '$\\frac{2}{3}$ ÷ $\\frac{3}{4}$ = $\\frac{8}{?}$'],
    ['1,200/144 = 8 1/3', '$\\frac{1,200}{144}$ = $8\\frac{1}{3}$'],
  ])('%s', (plain, tex) => {
    expect(toLatex(plain, 'middle')).toBe(tex);
    expect(fromLatex(tex)).toBe(plain);
  });

  it('leaves units, prose and K–2 alone', () => {
    expect(toLatex('Area = 24 cm²', 'middle')).toBeUndefined();
    expect(toLatex('60 km/h for 2 hours', 'middle')).toBeUndefined();
    expect(toLatex('Every number from 45 to 54 rounds to 50.', 'elementary')).toBeUndefined();
    expect(toLatex('1/2 of the pizza', 'early')).toBeUndefined();
  });

  it('parses the commands it draws, and refuses others', () => {
    expect(splitLine('$\\frac{1}{2}$ of 8').map((p) => p.t)).toEqual(['math', 'text']);
    expect(parseMath('3 \\times 4 \\le 12')).toEqual([{ t: 'text', s: '3 × 4 ≤ 12' }]);
    expect(() => parseMath('\\integral{x}')).toThrow();
  });
});
