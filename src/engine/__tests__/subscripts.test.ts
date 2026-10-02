import { fromLatex, toLatex } from '../latex';
import { subscriptRuns, withUnicodeSubscripts } from '../subscripts';

describe('subscripts', () => {
  it('turns subscripts Unicode has into characters', () => {
    expect(withUnicodeSubscripts('v_y = 3, F_net, v_max, t_h')).toBe('vᵧ = 3, Fₙₑₜ, vₘₐₓ, tₕ');
  });
  it('keeps the others as subscript runs', () => {
    expect(subscriptRuns('T_c = 300 K and F_N')).toEqual([
      { s: 'T' },
      { s: 'c', sub: true },
      { s: ' = 300 K and F' },
      { s: 'N', sub: true },
    ]);
  });
  it('college subscripts (HE-E7): several letters, Greek, marks and primes on the base, a comma', () => {
    expect(withUnicodeSubscripts('σ_max, S_ut, ṁ_in, ΔT_lm')).toBe('σₘₐₓ, Sᵤₜ, ṁᵢₙ, ΔTₗₘ');
    expect(subscriptRuns('T_h,in = 80, k_eff and f′_c')).toEqual([
      { s: 'T' },
      { s: 'h,in', sub: true },
      { s: ' = 80, k' },
      { s: 'eff', sub: true },
      { s: ' and f′' },
      { s: 'c', sub: true },
    ]);
    expect(subscriptRuns('Q̇_out and T_wall')).toEqual([
      { s: 'Q̇ₒᵤₜ and T' },
      { s: 'wall', sub: true },
    ]);
    // A list after a subscript keeps its space: "v_x, v_y".
    expect(withUnicodeSubscripts('(v_x, v_y)')).toBe('(vₓ, vᵧ)');
  });
  it('leaves names and plain underscores alone', () => {
    expect(subscriptRuns('MATH_12 and _x')).toEqual([{ s: 'MATH_12 and _x' }]);
    expect(subscriptRuns('no subscript')).toEqual([{ s: 'no subscript' }]);
  });
  it('typesets around a subscript without splitting it', () => {
    for (const line of ['H = h + v_y²/(2g)', 'a = F_net ÷ m', 'T_c ÷ T_h = 0.4', 'v_y t']) {
      const tex = toLatex(line, 'standard', ['h', 'g', 'm', 't']);
      if (tex) expect(fromLatex(tex)).toBe(line);
      // No math piece starts or ends inside a "symbol_subscript".
      expect(tex ?? '').not.toMatch(/\p{L}_\$|\$_|_\\|\p{L}\$_/u);
    }
  });
});
