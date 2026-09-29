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

  it('raises negative exponents and reads them back', () => {
    expect(both('3 × 10⁻⁴', 'middle')).toContain('^{-4}');
    expect(both('4.7 × 10⁵', 'middle')).toContain('^{5}');
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

  it('formulas: products, bracket powers with a division, subscripts, function names', () => {
    expect(both('v = cx + k', 'middle', ['v', 'c', 'x', 'k'])).toBe(
      '$\\mathit{v}$ = $\\mathit{c}\\mathit{x}$ + $\\mathit{k}$',
    );
    // A short word made of the letters stays a word.
    expect(toLatex('a is at most t', 'middle', ['a', 't'])).toBe(
      '$\\mathit{a}$ is at most $\\mathit{t}$',
    );
    expect(both('y = a × (1 + r ÷ 100)^t', 'standard', ['y', 'a', 'r', 't'])).toBe(
      '$\\mathit{y}$ = $\\mathit{a}$ × $\\pow{(1 + \\divfrac{\\mathit{r}}{100})}{\\mathit{t}}$',
    );
    expect(both('(1 + 10 ÷ 100)³', 'standard')).toBe('${(1 + \\divfrac{10}{100})}^{3}$');
    expect(both('v² = v₀² + 2 × a × d', 'standard', ['v', 'v₀', 'a', 'd'])).toBe(
      '${\\mathit{v}}^{2}$ = ${\\mathit{v₀}}^{2}$ + 2 × $\\mathit{a}$ × $\\mathit{d}$',
    );
    expect(both('a/b is at most 1', 'standard', ['a', 'b'])).toBe(
      '$\\tfrac{\\mathit{a}}{\\mathit{b}}$ is at most 1',
    );
    expect(both('f′(x) = c × x^n', 'standard', ['c', 'x', 'n'])).toBe(
      '$\\mathit{f}$′($\\mathit{x}$) = $\\mathit{c}$ × $\\pow{\\mathit{x}}{\\mathit{n}}$',
    );
    expect(toLatex('point x^power n', 'standard', ['x', 'n'])).not.toContain('\\pow');
    // Grade 6 formulas state a rule: ÷ stays inline there.
    expect(toLatex('c ÷ a = e', 'middle', ['c', 'a', 'e'], { solving: false })).toBe(
      '$\\mathit{c}$ ÷ $\\mathit{a}$ = $\\mathit{e}$',
    );
    // Words under a formula: only number fractions, small.
    expect(toLatex('Ribbons at 2 1/4 in = ribbons', 'elementary', [], { words: true })).toBe(
      'Ribbons at $2\\tfrac{1}{4}$ in = ribbons',
    );
    expect(toLatex('Leg a² + leg b² = hypotenuse²', 'standard', ['a', 'b'], { words: true })).toBe(
      undefined,
    );
    expect(both('3/4 is at most 1', 'elementary')).toBe('$\\tfrac{3}{4}$ is at most 1');
    // A dollar sign in the text is not a math delimiter.
    expect(both('t × $10 + f × $5 = T', 'standard', ['t', 'f', 'T'])).toBe(
      '$\\mathit{t}$ × \\$10 + $\\mathit{f}$ × \\$5 = $\\mathit{T}$',
    );
    expect(splitLine('\\$10 and $\\half$').map((p) => (p.t === 'text' ? p.s : 'math'))).toEqual([
      '$10 and ',
      'math',
    ]);
  });

  it('bars the block of a repeating decimal, and only of one', () => {
    expect(both('1 ÷ 6 = 0.1666…', 'middle')).toBe('1 ÷ 6 = $\\rep{0.1666…}$');
    expect(parseMath('\\rep{0.142857142857…}')).toEqual([
      { t: 'rep', lead: '0.', block: '142857', src: '0.142857142857…' },
    ]);
    expect(parseMath('\\rep{2.0909…}')).toEqual([
      { t: 'rep', lead: '2.', block: '09', src: '2.0909…' },
    ]);
    expect(toLatex('π ≈ 3.14159…', 'middle')).toBeUndefined();
  });

  it('parses the commands it draws, and refuses others', () => {
    expect(splitLine('$\\frac{1}{2}$ of 8').map((p) => p.t)).toEqual(['math', 'text']);
    expect(parseMath('3 \\times 4 \\le 12')).toEqual([{ t: 'text', s: '3 × 4 ≤ 12' }]);
    expect(() => parseMath('\\integral{x}')).toThrow();
    expect(withoutOuterBrackets(parseMath('(8 − 2)'))).toEqual([{ t: 'text', s: '8 − 2' }]);
    expect(withoutOuterBrackets(parseMath('(a) + (b)'))).toEqual([{ t: 'text', s: '(a) + (b)' }]);
  });
});
