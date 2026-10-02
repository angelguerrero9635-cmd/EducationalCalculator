import { renderTemplate } from '../format';
import {
  fromLatex,
  parseMath,
  splitLine,
  spokenMath,
  toLatex,
  withoutOuterBrackets,
} from '../latex';

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

  it('stacks a root written exactly over its bottom, and never divides from a bottom (E22)', () => {
    expect(both('x = −√3/2 ≈ −0.866', 'standard')).toBe('x = −$\\frac{\\sqrt{3}}{2}$ ≈ −0.866');
    expect(both('(−3 + √17)/4', 'standard')).toBe('$\\frac{−3 + \\sqrt{17}}{4}$');
    expect(both('1/2 ÷ (−3/2)', 'standard')).toBe('$\\frac{1}{2}$ ÷ (−$\\frac{3}{2}$)');
  });

  it('draws a sum with its limits as Σ, and reads it back (E5)', () => {
    expect(both('S = Σ from k = 1 to 8 of (3k − 1)', 'standard', ['S'])).toBe(
      '$\\mathit{S}$ = $\\sum_{\\mathit{k}=1}^{8}{(3\\mathit{k} − 1)}$',
    );
    // Letters in the limits and the body, a bracket raised to a power, one term, a sentence.
    expect(both('Σ from k = 1 to n of (ck + e) adds the terms.', 'standard', ['c', 'e', 'n'])).toBe(
      '$\\sum_{\\mathit{k}=1}^{\\mathit{n}}{(\\mathit{c}\\mathit{k} + \\mathit{e})}$ adds the terms.',
    );
    expect(both('Σ from i = 1 to 5 of (x − 4)² = 10', 'standard', ['x'])).toBe(
      '$\\sum_{\\mathit{i}=1}^{5}{{(\\mathit{x} − 4)}^{2}}$ = 10',
    );
    expect(both('Σ from k = 0 to 6 of 2^k = 127', 'standard')).toBe(
      '$\\sum_{\\mathit{k}=0}^{6}{\\pow{2}{\\mathit{k}}}$ = 127',
    );
    expect(both('Σ from k = −2 to 2 of k³ = 0', 'standard')).toContain(
      '\\sum_{\\mathit{k}=−2}^{2}',
    );
    // Value slots in the limits and the body, filled before typesetting.
    const vars = [
      { id: 'n', symbol: 'n', name: 'n' },
      { id: 'c', symbol: 'c', name: 'c' },
      { id: 'e', symbol: 'e', name: 'e' },
    ];
    const line = renderTemplate('Σ from k = 1 to {n} of ({c}k + {e})', vars, { n: 8, c: 3, e: 2 });
    expect(line).toBe('Σ from k = 1 to 8 of (3k + 2)');
    expect(both(line, 'standard')).toBe('$\\sum_{\\mathit{k}=1}^{8}{(3\\mathit{k} + 2)}$');
    // Only high school and college draw it; the parse gives the limits and the body.
    expect(toLatex('Σ from k = 1 to 8 of k', 'middle')).toBeUndefined();
    const [sum] = parseMath('\\sum_{k=1}^{8}{(3k − 1)}');
    expect(sum).toEqual({
      t: 'sum',
      lower: [{ t: 'text', s: 'k=1' }],
      upper: [{ t: 'text', s: '8' }],
      body: [{ t: 'text', s: '(3k − 1)' }],
    });
    expect(() => parseMath('\\sum{k}')).toThrow();
  });

  it('says a sum with its limits in words for a screen reader (E5)', () => {
    expect(spokenMath('S = Σ from k = 1 to 8 of (3k − 1)')).toBe(
      'S = the sum from k = 1 to 8 of (3k − 1)',
    );
    expect(spokenMath('Σ from k = 1 to 8 of (3k − 1) = 100')).toBe(
      'The sum from k = 1 to 8 of (3k − 1) = 100',
    );
    expect(spokenMath('χ² = Σ (O − E)² ÷ E')).toBe('χ² = Σ (O − E)² ÷ E');
  });

  it('college symbols (HE-E7): an integral with its limits, marks, ∂, subscripts kept whole', () => {
    expect(both('∫ from 0 to 2 of (x² + 1) dx = 32/3', 'standard', ['x'])).toBe(
      '$\\int_{0}^{2}{({\\mathit{x}}^{2} + 1) dx}$ = $\\frac{32}{3}$',
    );
    expect(both('W = ∫ from V₁ to V₂ of P dV', 'standard', ['W', 'P', 'V₁', 'V₂'])).toBe(
      '$\\mathit{W}$ = $\\int_{\\mathit{V₁}}^{\\mathit{V₂}}{\\mathit{P} dV}$',
    );
    // The d and its variable over a bracket: one bracket deep inside.
    expect(both('t = ∫ from 0 to X of dX ÷ (k(1 − X))', 'standard', ['t', 'X', 'k'])).toContain(
      '\\int_{0}^{\\mathit{X}}{dX ÷ (\\mathit{k}(1 − \\mathit{X}))}',
    );
    const [int] = parseMath('\\int_{0}^{2}{x dx}');
    expect(int).toEqual({
      t: 'int',
      lower: [{ t: 'text', s: '0' }],
      upper: [{ t: 'text', s: '2' }],
      body: [{ t: 'text', s: 'x dx' }],
    });
    // Dotted and hatted letters are symbols like any other, never split from their mark.
    expect(both('Q̇ = ṁ × c_p × ΔT', 'standard', ['Q̇', 'ṁ', 'c_p', 'ΔT'])).toBe(
      '$\\mathit{Q̇}$ = $\\mathit{ṁ}$ × c_p × ΔT',
    );
    expect(both('t = d̄ ÷ SE', 'standard', ['d̄', 't'])).toBe(
      '$\\mathit{t}$ = $\\divfrac{\\mathit{d̄}}{SE}$',
    );
    expect(both('∂U ÷ ∂P = 4', 'standard', ['U', 'P'])).toBe(
      '$\\divfrac{∂\\mathit{U}}{∂\\mathit{P}}$ = 4',
    );
    // Subscripts of several letters, Greek, or in two parts stay whole inside a division.
    expect(both('q = k_eff × A × (T_wall − T_h,in) ÷ L', 'standard', ['q', 'A', 'L'])).toBe(
      '$\\mathit{q}$ = k_eff × $\\mathit{A}$ × $\\divfrac{(T_wall − T_h,in)}{\\mathit{L}}$',
    );
    expect(both('σ_max = M × c ÷ I', 'standard', ['M', 'c', 'I'])).toBe(
      'σ_max = $\\mathit{M}$ × $\\divfrac{\\mathit{c}}{\\mathit{I}}$',
    );
    // A fractional exponent with a bracket inside: (P₂ ÷ P₁)^((k − 1)/k).
    expect(both('T₂ = 300 × (800 ÷ 100)^((1.4 − 1)/1.4)', 'standard')).toBe(
      'T₂ = 300 × $\\pow{(\\divfrac{800}{100})}{((1.4 − 1)/1.4)}$',
    );
    expect(both('E = 10^(1.5 × (−4))', 'standard', ['E'])).toBe(
      '$\\mathit{E}$ = $\\pow{10}{(1.5 × (−4))}$',
    );
    // A root's bracket raised keeps its root bar.
    expect(both('ρ = √(0 + 64)^(1 ÷ 3)', 'standard', ['ρ'])).toContain('\\sqrt{(0 + 64)}');
    // ⌈ ⌉, ⌊ ⌋, ħ, ∇ and bold or arrowed vectors pass through as text.
    expect(both('n = ⌈12.5 ÷ 4⌉ = 4', 'standard', ['n'])).toBe(
      '$\\mathit{n}$ = ⌈$\\divfrac{12.5}{4}$⌉ = 4',
    );
    expect(both('v⃗ = 3x̂ + 4ŷ; |𝐅| = 5', 'standard', ['v⃗'])).toBe(
      '$\\mathit{v⃗}$ = 3x̂ + 4ŷ; |𝐅| = 5',
    );
    expect(parseMath('\\partial \\nabla \\hbar \\lfloor x \\rfloor')).toEqual([
      { t: 'text', s: '∂ ∇ ħ ⌊ x ⌋' },
    ]);
  });

  it('a function stays whole over or under a division bar', () => {
    expect(both('b = 9 × sin(80°) ÷ sin(35°)', 'standard', ['b'])).toBe(
      '$\\mathit{b}$ = 9 × $\\divfrac{sin(80°)}{sin(35°)}$',
    );
    expect(both('x = log₁₀ 12 ÷ log₁₀ 2', 'standard', ['x'])).toBe(
      '$\\mathit{x}$ = $\\divfrac{log₁₀ 12}{log₁₀ 2}$',
    );
    expect(both('ΔT_lm = (ΔT₁ − ΔT₂) ÷ ln(ΔT₁ ÷ ΔT₂)', 'standard')).toBe(
      'ΔT_lm = $\\divfrac{(ΔT₁ − ΔT₂)}{ln(ΔT₁ ÷ ΔT₂)}$',
    );
  });

  it('says college symbols in words for a screen reader (HE-E7)', () => {
    expect(spokenMath('W = ∫ from V₁ to V₂ of P dV')).toBe(
      'W = the integral from V₁ to V₂ of P dV',
    );
    expect(spokenMath('Q̇ = ṁ × c_p × ΔT')).toBe('Q dot = m dot × c sub p × ΔT');
    expect(spokenMath('∂U ÷ ∂P and ∇·E')).toBe('partial U ÷ partial P and del dot E');
    expect(spokenMath('n = ⌈x⌉ + ⌊y⌋')).toBe('n = ceiling of x + floor of y');
    expect(spokenMath('x̄ and p̂ and v⃗')).toBe('x bar and p hat and v vector');
    expect(spokenMath('T_h,in − T_wall')).toBe('T sub h,in − T sub wall');
  });

  it('parses the commands it draws, and refuses others', () => {
    expect(splitLine('$\\frac{1}{2}$ of 8').map((p) => p.t)).toEqual(['math', 'text']);
    expect(parseMath('3 \\times 4 \\le 12')).toEqual([{ t: 'text', s: '3 × 4 ≤ 12' }]);
    expect(() => parseMath('\\integral{x}')).toThrow();
    expect(withoutOuterBrackets(parseMath('(8 − 2)'))).toEqual([{ t: 'text', s: '8 − 2' }]);
    expect(withoutOuterBrackets(parseMath('(a) + (b)'))).toEqual([{ t: 'text', s: '(a) + (b)' }]);
  });
});
