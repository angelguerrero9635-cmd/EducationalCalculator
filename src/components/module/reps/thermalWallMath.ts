/**
 * The arithmetic a `thermalWall` picture draws (HC23), shared with its harness check. Every
 * profile is computed from the page's values: a straight drop through each plane layer (q × L ÷ k),
 * a log profile through a cylinder's wall, a parabola through a wire with heat generation, a fin's
 * cosh decay, and σT⁴ for radiation (σ from the page).
 */

/** The resistances of a plane wall per unit area, film, layers, film (undefined: not there). */
export function wallResistances(
  hIn: number | undefined,
  layers: { L: number; k: number }[],
  hOut: number | undefined,
) {
  return [
    ...(hIn !== undefined ? [{ kind: 'film' as const, R: 1 / hIn }] : []),
    ...layers.map((l) => ({ kind: 'layer' as const, R: l.L / l.k })),
    ...(hOut !== undefined ? [{ kind: 'film' as const, R: 1 / hOut }] : []),
  ];
}

/**
 * The temperatures at each node of a series of resistances, from T_in, with flux q: each drop is
 * q × R. The last node is T_out when q = ΔT ÷ ΣR.
 */
export function seriesTemperatures(Tin: number, q: number, Rs: number[]): number[] {
  const out = [Tin];
  for (const R of Rs) out.push(out[out.length - 1]! - q * R);
  return out;
}

/** Conduction resistance of a cylindrical shell per unit length (or for a length L). */
export const cylinderR = (r1: number, r2: number, k: number, L = 1) =>
  Math.log(r2 / r1) / (2 * Math.PI * k * L);

/** The convection resistance outside a cylinder of radius r per unit length (or length L). */
export const filmR = (r: number, h: number, L = 1) => 1 / (2 * Math.PI * r * h * L);

/** T(r) through a cylindrical wall from T₁ at r₁ to T₂ at r₂ (a log profile). */
export const cylinderT = (r: number, r1: number, r2: number, T1: number, T2: number) =>
  T1 + ((T2 - T1) * Math.log(r / r1)) / Math.log(r2 / r1);

/** A pin fin (adiabatic tip): m = √(hP ÷ kA_c) = √(4h ÷ kD); θ(x) ÷ θ_b = cosh(m(L − x)) ÷ cosh(mL). */
export const finM = (h: number, k: number, D: number) => Math.sqrt((4 * h) / (k * D));
export const finTheta = (x: number, m: number, L: number) =>
  Math.cosh(m * (L - x)) / Math.cosh(m * L);
/** The fin's heat: √(hPkA_c) θ_b tanh(mL). */
export const finQ = (h: number, k: number, D: number, L: number, thetaB: number) => {
  const P = Math.PI * D;
  const A = (Math.PI * D * D) / 4;
  return Math.sqrt(h * P * k * A) * thetaB * Math.tanh(finM(h, k, D) * L);
};

/** A wire with heat generation S: T(r) = T_s + S(R² − r²) ÷ 4k. */
export const wireT = (r: number, R: number, S: number, k: number, Ts: number) =>
  Ts + (S * (R * R - r * r)) / (4 * k);

/** Emitted and absorbed radiation per unit area of a gray surface: εσT⁴ (T in K). */
export const radiant = (eps: number, sigma: number, T: number) => eps * sigma * T ** 4;

/** Kelvins from a temperature in its unit. */
export const toKelvin = (T: number, unit: string | undefined) => (unit === 'K' ? T : T + 273.15);
