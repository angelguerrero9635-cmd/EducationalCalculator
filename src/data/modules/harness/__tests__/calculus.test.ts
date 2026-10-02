import { expForm, polyDerivative, polyForm } from '../../college/forms';
import { CALCULUS_MARK, checkCalculus } from '../calculus';
import { evaluate, evaluateAt, implicitTimes, lettersIn, limitOf } from '../evaluate';

/** The problems found in a walkthrough's lines, as "kind: problem" (empty when all hold). */
const problems = (lines: string[]) =>
  checkCalculus(lines)
    .filter((v) => v.problem)
    .map((v) => `${v.kind} ${v.problem}: ${v.clause}`);
/** The kinds of clause read (checked) in the lines. */
const kinds = (lines: string[]) => checkCalculus(lines).map((v) => v.kind);

describe('reading forms (HE-E6)', () => {
  it('finds the letters of a form, function names, e and π left out', () => {
    expect(lettersIn('12x² − 240x + 900')).toEqual(['x']);
    expect(lettersIn('2xy + sin(x) + e^(2t) + π')).toEqual(['x', 'y', 't']);
    expect(lettersIn('ln|x| + log₁₀(x) + exp(x₀)')).toEqual(['x', 'x₀']);
  });
  it('makes implicit products explicit once the letters are numbers', () => {
    expect(implicitTimes('3(2)² − 4')).toBe('3 × (2)² − 4');
    expect(implicitTimes('50e^(−0.6)')).toBe('50 × e^(−0.6)');
    expect(implicitTimes('(1)(2)')).toBe('(1) × (2)');
    expect(implicitTimes('2cos(1)')).toBe('2 × cos(1)');
    // one number in scientific notation, and an inverse sine, stay as they are
    expect(implicitTimes('1e-7 + sin⁻¹(0.5)')).toBe('1e-7 + sin⁻¹(0.5)');
  });
  it('evaluates a form at a point', () => {
    expect(evaluateAt('12x² − 240x + 900', { x: 5 })).toBeCloseTo(0, 12);
    expect(evaluateAt('x²y + 3y', { x: 1, y: 2 })).toBe(8);
    expect(evaluateAt('(1 + 3t)e^(−2t)', { t: 0.5 })).toBeCloseTo(2.5 * Math.exp(-1), 12);
    expect(evaluateAt('2xy', { x: -0.5, y: 3 })).toBe(-3);
  });
});

describe('antiderivatives at their limits and limits (evaluate)', () => {
  it('works out [F] from a to b as F(b) − F(a)', () => {
    expect(evaluate('[x³ ÷ 3] from 0 to 2')).toBeCloseTo(8 / 3, 12);
    expect(evaluate('[x³/3 + x] from 1 to 3')).toBeCloseTo(32 / 3, 12);
    expect(evaluate('[−cos(t)] from 0 to π')).toBeCloseTo(2, 12);
    expect(evaluate('[ln|u|] from 1 to e')).toBeCloseTo(1, 12);
    // a bracket with two letters, or a letter for a limit, is not read
    expect(evaluate('[x²y] from 0 to 1')).toBeUndefined();
    expect(evaluate('[x²] from 0 to b')).toBeUndefined();
  });
  it('works out a limit near its point, from both sides or the one written', () => {
    expect(evaluate('lim x → 2 of (x² − 4) ÷ (x − 2)')).toBeCloseTo(4, 6);
    expect(evaluate('lim as h → 0 of sin(h) ÷ h')).toBeCloseTo(1, 6);
    expect(evaluate('lim (x → 0) of (e^(2x) − 1) ÷ (3x)')).toBeCloseTo(2 / 3, 6);
    expect(evaluate('lim x → 0 of (1 − cos(x)) ÷ x²')).toBeCloseTo(0.5, 5);
    expect(evaluate('lim x → ∞ of (2x + 1) ÷ (x − 3)')).toBeCloseTo(2, 5);
    expect(evaluate('lim x → −∞ of (3x² + 1) ÷ (x² − 5)')).toBeCloseTo(3, 5);
    expect(evaluate('lim x → 0⁺ of √x')).toBeCloseTo(0, 3);
    expect(evaluate('lim x → 0⁺ of |x| ÷ x')).toBeCloseTo(1, 9);
    // no limit: the sides disagree, or the values run off
    expect(evaluate('lim x → 0 of |x| ÷ x')).toBeUndefined();
    expect(evaluate('lim x → 0 of 1 ÷ x²')).toBeUndefined();
    expect(limitOf('e^x', 'x', '∞')).toBeUndefined();
  });
  it('reads an integrand with e after its number (50e^(…))', () => {
    expect(evaluate('∫ from 0 to 5 of (50e^(−0.2t)) dt')).toBeCloseTo(250 * (1 - Math.exp(-1)), 9);
  });
});

describe('checking calculus lines (HE-E6)', () => {
  it('checks a derivative form against the function and its value at the point', () => {
    const lines = ['f(x) = x³ − 4x', 'f′(x) = 3x² − 4 → f′(2) = 3(2)² − 4 = 8'];
    expect(problems(lines)).toEqual([]);
    expect(kinds(lines)).toEqual(['form', 'derivative', 'value']);
    expect(problems(['f(x) = x³ − 4x', 'f′(x) = 3x² + 4'])).toEqual([
      'derivative wrong: f′(x) = 3x² + 4',
    ]);
    expect(problems(['f(x) = x³ − 4x', 'f′(x) = 3x² − 4 → f′(2) = 9'])).toEqual([
      'value wrong: f′(2) = 9',
    ]);
    // a value worked from the function itself when no derivative form is stated
    expect(problems(['f(x) = x³ − 4x', 'f′(2) = 8'])).toEqual([]);
    expect(problems(['f(x) = x³ − 4x', 'f″(2) = 12'])).toEqual([]);
    expect(problems(['f(x) = x³ − 4x', 'f″(x) = 6x', 'f″(2) = 11'])).toEqual([
      'value wrong: f″(2) = 11',
    ]);
  });
  it('checks a form line of a plan (V′(x)) at sample points, stated before or after V', () => {
    const v = 'V(x) = x(30 − 2x)(30 − 2x)';
    expect(problems([v, 'V′(x) = 12x² − 240x + 900'])).toEqual([]);
    expect(problems(['V′(x) = 12x² − 240x + 900', v])).toEqual([]);
    expect(problems([v, 'V′(x) = 12x² − 240x + 800'])).toEqual([
      'derivative wrong: V′(x) = 12x² − 240x + 800',
    ]);
    // stated alone, a form must read at sample points
    expect(problems(['V′(x) = 12x² − 240x + 900 → V′(5) = 0'])).toEqual([]);
    expect(problems(['V′(x) = 12x² − 240x + 900 → V′(5) = 10'])).toEqual([
      'value wrong: V′(5) = 10',
    ]);
  });
  it('reads d/dx, dy/dx and d²y/dx², and a rule with its name before a colon', () => {
    expect(problems(['d/dx (x³ − 4x) = 3x² − 4'])).toEqual([]);
    expect(problems(['d/dx [sin(2x)] = 2cos(2x)'])).toEqual([]);
    expect(problems(['d/dx (x³ − 4x) = 3x²'])).toHaveLength(1);
    expect(problems(['y(x) = 3x² + 2x', 'dy/dx = 6x + 2', 'dy/dx at x = 2 = 14'])).toEqual([]);
    expect(problems(['y(x) = 3x² + 2x', 'd²y/dx² = 6'])).toEqual([]);
    expect(problems(['y(x) = 3x² + 2x', 'dy/dx at x = 2 = 12'])).toEqual([
      'value wrong: dy/dx at x = 2 = 12',
    ]);
    expect(problems(['Chain rule: f(x) = (2x + 1)³, so f′(x) = 6(2x + 1)²'])).toEqual([]);
    expect(problems(['Chain rule: f(x) = (2x + 1)³, so f′(x) = 3(2x + 1)²'])).toHaveLength(1);
  });
  it('checks partial derivatives in either notation, and at a point', () => {
    const f = 'f(x, y) = x²y + 3y';
    expect(problems([f, 'f_x(x, y) = 2xy', '∂f/∂y = x² + 3', 'f_x(1, 2) = 2 × 1 × 2 = 4'])).toEqual(
      [],
    );
    expect(problems([f, '∂f/∂x at (1, 2) = 4', '∂²f/∂x∂y = 2x', 'f_xx(x, y) = 2y'])).toEqual([]);
    expect(problems([f, '∂f ÷ ∂y = x²'])).toEqual(['derivative wrong: ∂f ÷ ∂y = x²']);
    expect(problems([f, 'f_y(1, 2) = 5'])).toEqual(['value wrong: f_y(1, 2) = 5']);
  });
  it('checks a definite integral with its antiderivative, and an indefinite one', () => {
    expect(problems(['∫ from 0 to 2 of x² dx = [x³ ÷ 3] from 0 to 2 = 8 ÷ 3 − 0 = 8 ÷ 3'])).toEqual(
      [],
    );
    expect(problems(['[x³ ÷ 3] from 0 to 2 = 8/3 ≈ 2.667'])).toEqual([]);
    expect(problems(['∫ from 1 to 3 of (x² + 1) dx = 32/3'])).toEqual([]);
    expect(problems(['∫ from 1 to 3 of (x² + 1) dx = 10'])).toEqual([
      'integral wrong: ∫ from 1 to 3 of (x² + 1) dx = 10',
    ]);
    // an antiderivative that is wrong between the limits, though right at both ends
    expect(problems(['∫ from 0 to 2 of x dx = [x³ − 3x² + 4x] from 0 to 2 = 2'])).toEqual([
      'integral wrong: ∫ from 0 to 2 of x dx = [x³ − 3x² + 4x] from 0 to 2 = 2',
    ]);
    expect(problems(['∫ 3x² dx = x³ + C'])).toEqual([]);
    expect(problems(['∫ e^(2t) dt = e^(2t) ÷ 2 + C'])).toEqual([]);
    expect(problems(['∫ 3x² dx = x³ ÷ 3 + C'])).toHaveLength(1);
    // a rule in letters is not checked
    expect(checkCalculus(['I = ∫ from a to b of (x² + 1) dx'])).toEqual([]);
    expect(checkCalculus(['∫ from a to b of f(x) dx = F(b) − F(a)'])).toEqual([]);
    // an integral the harness can't read is reported
    expect(problems(['∫ from 0 to 2 of x!? dx = 3'])).toHaveLength(1);
  });
  it('checks a limit by evaluating near the point', () => {
    expect(problems(['lim x → 2 of (x² − 4) ÷ (x − 2) = 4'])).toEqual([]);
    expect(problems(['lim x → 2 of (x² − 4) ÷ (x − 2) = 2'])).toEqual([
      'limit wrong: lim x → 2 of (x² − 4) ÷ (x − 2) = 2',
    ]);
    expect(problems(['lim x → 0 of (e^(2x) − 1) ÷ (3x) = 2 ÷ 3 ≈ 0.6667'])).toEqual([]);
    expect(problems(['lim x → ∞ of (2x + 1) ÷ (x − 3) = 2'])).toEqual([]);
    expect(problems(['lim x → 0 of |x| ÷ x = 1'])).toEqual([
      'limit unread: lim x → 0 of |x| ÷ x = 1',
    ]);
    // the definition of the derivative, in letters, is not checked
    expect(checkCalculus(['f′(x) = lim (h → 0) [f(x + h) − f(x)] ÷ h'])).toEqual([]);
  });
  it('checks an ODE solution in closed form, its value and its start', () => {
    const growth = ['y′ = −0.2y', 'y(t) = 50e^(−0.2t)', 'y(0) = 50', 'y(3) = 50e^(−0.6) = 27.44'];
    expect(problems(growth)).toEqual([]);
    expect(kinds(growth)).toEqual(['ode', 'form', 'value', 'value']);
    expect(problems(['dy/dt = −0.2y', 'y(t) = 50e^(0.2t)'])).toEqual(['ode wrong: dy/dt = −0.2y']);
    expect(problems(['y(t) = 50e^(−0.2t)', 'y(3) = 30'])).toEqual(['value wrong: y(3) = 30']);
    // Newton's cooling toward 20 °C
    expect(problems(['T′ = −0.1(T − 20)', 'T(t) = 20 + 60e^(−0.1t)'])).toEqual([]);
  });
  it('checks the damped oscillator’s three regimes', () => {
    // underdamped: roots −1 ± 2i
    expect(
      problems([
        'y″ + 2y′ + 5y = 0',
        'y(t) = e^(−t)(2cos(2t) + 1.5sin(2t))',
        'y(0) = 2',
        'y′(0) = 1',
      ]),
    ).toEqual([]);
    // critically damped: a double root −2
    expect(problems(['y″ + 4y′ + 4y = 0', 'y(t) = (1 + 3t)e^(−2t)', 'y′(0) = 1'])).toEqual([]);
    // overdamped: roots −1 and −4
    expect(problems(['y″ + 5y′ + 4y = 0', 'y(t) = 2e^(−t) − e^(−4t)', 'y′(0) = 2'])).toEqual([]);
    // the wrong regime's solution fails
    expect(problems(['y″ + 4y′ + 4y = 0', 'y(t) = 2e^(−t) − e^(−4t)'])).toEqual([
      'ode wrong: y″ + 4y′ + 4y = 0',
    ]);
    // a mass on a spring, written with its m, c and k put in, and a rounded frequency
    expect(problems(['2x″ + 0.8x′ + 50x = 0', 'x(t) = 0.1e^(−0.2t)cos(4.995t)'])).toEqual([]);
  });
  it('leaves Grades 9–12 lines with primes alone (an image point, a rule in letters)', () => {
    const lines = [
      'x′ = cx − sy',
      'x′ = 0.8 × 3 − 0.6 × 4',
      'y″ = sx + cy',
      'f′(x) = n × c × x^(n − 1)',
      'f′(x) = 2 × 1 × 1.5^(2 − 1)',
      'f(x) = 1 × 1.5^2',
      'A′ + C′ = A + C',
    ];
    expect(checkCalculus(lines)).toEqual([]);
    expect(lines.some((l) => CALCULUS_MARK.test(l))).toBe(true);
    expect(CALCULUS_MARK.test('x′ = cx − sy')).toBe(false);
    expect(CALCULUS_MARK.test('Find [H₂] from Q, then take the old [H₂].')).toBe(false);
  });
});

describe('form lines a page writes (college/forms.ts)', () => {
  it('writes polynomials and exponentials with their signs', () => {
    expect(polyForm([12, -240, 900])).toBe('12x² − 240x + 900');
    expect(polyForm([1, 0, -4, 0])).toBe('x³ − 4x');
    expect(polyForm([-1, 0.5, 0], 't')).toBe('−t² + 0.5t');
    expect(polyForm([0, 0])).toBe('0');
    expect(polyDerivative([4, -120, 900, 0])).toEqual([12, -240, 900]);
    expect(expForm(50, -0.2)).toBe('50e^(−0.2t)');
    expect(expForm(-1, 2, 'x')).toBe('−e^(2x)');
    expect(expForm(3, 0)).toBe('3');
  });
  it('writes forms the harness reads and checks', () => {
    const f = [4, -120, 900, 0];
    expect(
      problems([
        `V(x) = ${polyForm(f)}`,
        `V′(x) = ${polyForm(polyDerivative(f))} → V′(5) = 0`,
        `V″(x) = ${polyForm(polyDerivative(polyDerivative(f)))}`,
      ]),
    ).toEqual([]);
    expect(problems(['y′ = −0.2y', `y(t) = ${expForm(50, -0.2)}`])).toEqual([]);
  });
});
