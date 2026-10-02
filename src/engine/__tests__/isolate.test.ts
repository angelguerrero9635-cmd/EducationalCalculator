import { closedValues, isolate, movesSentence, readExpr, evalExpr } from '../isolate';

describe('isolate (HE-E18 closed forms from a display)', () => {
  it('takes ln of both sides for a value in an exponent', () => {
    const [w] = isolate('{A} = {P} × e^({r} × {t})', 't')!;
    expect(w!.expr).toBe('ln({A} ÷ {P}) ÷ {r}');
    expect(movesSentence(w!.moves)).toBe(
      'Divide both sides by {P}, take ln of both sides, then divide both sides by {r}.',
    );
    const [t] = closedValues('{A} = {P} × e^({r} × {t})', 't', { A: 3000, P: 2000, r: 0.05 })!;
    expect(t).toBeCloseTo(Math.log(1.5) / 0.05, 12);
  });

  it('reads e^{{r}{t}} braces and side-by-side letters', () => {
    const [t] = closedValues('{A} = {P}e^{{r}{t}}', 't', { A: 3000, P: 2000, r: 0.05 })!;
    expect(t).toBeCloseTo(Math.log(1.5) / 0.05, 12);
  });

  it('finds an exponent n from aⁿ = b with logs, and k from a half-life', () => {
    expect(isolate('{a} × {b}^{x} = {c}', 'x')![0]!.expr).toBe('log₁₀({c} ÷ {a}) ÷ log₁₀({b})');
    const [x] = closedValues('{a} × {b}^{x} = {c}', 'x', { a: 5, b: 2, c: 60 })!;
    expect(x).toBeCloseTo(Math.log2(12), 12);
    const [k] = closedValues('{N} = {N0} × e^(−{k} × {t})', 'k', { N: 25, N0: 100, t: 10 })!;
    expect(k).toBeCloseTo(Math.log(4) / 10, 12);
    const [T] = closedValues('{N} = {N0} × (1/2)^({t} ÷ {h})', 'h', { N: 25, N0: 100, t: 10 })!;
    expect(T).toBeCloseTo(5, 12);
  });

  it('undoes logs, roots and fractional powers', () => {
    expect(closedValues('{L} = 10 × log₁₀({I} ÷ {I0})', 'I', { L: 60, I0: 1e-12 })![0]).toBeCloseTo(
      1e-6,
      18,
    );
    expect(closedValues('{T} = ∜({F} ÷ (5.67 × 10⁻⁸))', 'F', { T: 300 })![0]).toBeCloseTo(
      5.67e-8 * 300 ** 4,
      6,
    );
    expect(closedValues('{T} = 278 × {L}^(1/4) ÷ √{a}', 'L', { T: 278, a: 1 })![0]).toBeCloseTo(
      1,
      12,
    );
    expect(closedValues('{T} = {p}^0.286', 'p', { T: 2 })![0]).toBeCloseTo(2 ** (1 / 0.286), 9);
    // two roots for a square: + and −
    expect(closedValues('{y} = {x}² + 1', 'x', { y: 10 })!.sort()).toEqual([-3, 3]);
  });

  it('gives nothing for a value twice, an angle or words', () => {
    expect(isolate('{T} = ln(1 + {k} × {Q} ÷ {r}) ÷ {k}', 'k')).toBeUndefined();
    expect(isolate('{s} = {a} ÷ {b} × sin({t})', 't')).toBeUndefined();
    expect(isolate('{n} = exponent of the power of ten at or below {I}', 'I')).toBeUndefined();
    expect(isolate('{a} × {x} + {b} = {c} × {x} + {d}', 'x')).toBeUndefined();
  });

  it('solves a linear rule for a coefficient', () => {
    const [a] = closedValues('{a} × {x} + {b} = {c} × {x} + {d}', 'a', { x: 2, b: 1, c: 3, d: 5 })!;
    expect(a).toBeCloseTo(5, 12);
  });

  it('undoes a whole product or sum in one move', () => {
    const [m] = isolate('{K} = ½ × {m} × {v}²', 'm')!;
    expect(m!.expr).toBe('{K} ÷ (½ × {v}²)');
    expect(m!.moves).toEqual(['divide both sides by (½ × {v}²)']);
    const [q] = isolate('{F} = {n} × 1.602 × 10⁻¹⁹ × {v} × {B}', 'n')!;
    expect(q!.moves).toEqual(['divide both sides by (1.602 × 10⁻¹⁹ × {v} × {B})']);
    const [r] = isolate('1/{R} = 1/{a} + 1/{b} + 1/{c}', 'a')!;
    expect(r!.expr).toBe('1 ÷ (1 ÷ {R} − (1 ÷ {b} + 1 ÷ {c}))');
    expect(movesSentence(r!.moves)).toBe(
      'Subtract (1 ÷ {b} + 1 ÷ {c}) from both sides, then flip both sides over.',
    );
    const [n] = isolate('{V} = {P} × {N} ÷ {n}', 'n')!;
    expect(movesSentence(n!.moves)).toBe('Flip both sides over and multiply by ({P} × {N}).');
  });

  it('reads scientific notation, thousands and ½', () => {
    const e = readExpr('8.99 × 10⁹ × {a} × 10⁻⁶/({r}²) + ½ × 6,371')!;
    expect(evalExpr(e, { a: 1, r: 1 })).toBeCloseTo(8990 + 3185.5, 6);
  });
});
