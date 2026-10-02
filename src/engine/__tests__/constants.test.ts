import {
  CONSTANTS,
  G_COLLEGE,
  G_K12,
  constant,
  constantLine,
  gFor,
  readConstant,
  valueOf,
} from '../constants';

describe('constants registry (HE-E9)', () => {
  it('reads g by the page: 9.81 on college pages, 9.8 on K–12 pages', () => {
    expect(gFor('he.physics.university-1#0')).toBe(9.81);
    expect(gFor('he.engineering.statics#2~trusses')).toBe(G_COLLEGE);
    expect(gFor('s.8.newtons-laws')).toBe(9.8);
    expect(gFor('s.11.projectile-motion~range')).toBe(G_K12);
    expect(gFor(undefined)).toBe(9.8);
    expect(valueOf('g', 'he.engineering.dynamics#0')).toBe(9.81);
    expect(constantLine('g', 's.11.energy')).toBe('g = 9.8 m/s²');
    expect(constantLine('g', 'he.physics.university-1#0')).toBe('g = 9.81 m/s²');
  });

  it('prints each constant as the steps write it', () => {
    expect(constantLine('R')).toBe('R = 8.314 J/(mol·K)');
    expect(constantLine('RLatm')).toBe('R = 0.08206 L·atm/(mol·K)');
    expect(constantLine('NA')).toBe('N_A = 6.022 × 10²³ mol⁻¹');
    expect(constantLine('F')).toBe('F = 96,485 C/mol');
    expect(constantLine('Kw')).toBe('K_w = 1.0 × 10⁻¹⁴');
    expect(constantLine('REarthEquator')).toBe('R_E = 6,378,000 m');
  });

  it('keeps each printed number equal to the value computed with, and near the precise one', () => {
    for (const k of Object.values(CONSTANTS)) {
      const line = constantLine(k.id, 'he.x');
      expect(readConstant(line, 'he.x')?.id).toBeDefined();
      if (k.precise !== undefined) {
        // Rounded to the figures it prints (4 significant figures, or 9.81 for 9.80665).
        expect(Math.abs(k.value - k.precise) / k.precise).toBeLessThan(2e-3);
      }
    }
  });

  it('reads a stated constant back for the harness', () => {
    expect(readConstant('R = 8.314 J/(mol·K)')?.id).toBe('R');
    expect(readConstant('k_B = 1.381 × 10⁻²³ J/K')?.value).toBe(1.381e-23);
    expect(readConstant('g = 9.8 m/s²', 's.8.newtons-laws')?.value).toBe(9.8);
    // A college page's g is 9.81: a 9.8 line there is not the registry's.
    expect(readConstant('g = 9.8 m/s²', 'he.physics.university-1#0')).toBeUndefined();
    expect(readConstant('R = 8.31 J/(mol·K)')).toBeUndefined();
    expect(readConstant('x = 4 m')).toBeUndefined();
  });

  it('names the constants the plans ask for', () => {
    for (const id of ['G', 'c', 'h', 'kB', 'NA', 'R', 'e', 'eps0', 'mu0', 'sigma'] as const) {
      expect(constant(id).value).toBeGreaterThan(0);
    }
    expect(constant('REarthMean').value).toBe(6.371e6);
    expect(constant('mu0').value).toBeCloseTo(1.2566e-6, 9);
  });
});
