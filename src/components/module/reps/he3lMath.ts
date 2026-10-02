/**
 * The sums behind the round-3 group L pictures (typesHe3l.ts): slit, grating and thin-film
 * optics, phase-space curves, plane waves and line standing waves. All in SI; the pictures and
 * the harness check share them.
 */

/** The speed of light (m/s) and the vacuum's permittivity and impedance. */
export const LIGHT_SPEED = 299792458;
export const EPSILON_0 = 8.8541878128e-12;
export const ETA_0 = LIGHT_SPEED * 4e-7 * Math.PI;

const DEG = Math.PI / 180;

/** SI per unit for the units the group's pages use; undefined for one it doesn't know. */
const UNITS: Record<string, number> = {
  nm: 1e-9,
  'μm': 1e-6,
  mm: 1e-3,
  cm: 1e-2,
  m: 1,
  km: 1e3,
  T: 1,
  mT: 1e-3,
  'μT': 1e-6,
  nT: 1e-9,
  'V/m': 1,
  'mV/m': 1e-3,
  'kV/m': 1e3,
  'A/m': 1,
  'mA/m': 1e-3,
  'μA/m': 1e-6,
  'W/m²': 1,
  'mW/m²': 1e-3,
  'μW/m²': 1e-6,
  'kW/m²': 1e3,
  Hz: 1,
  kHz: 1e3,
  MHz: 1e6,
  GHz: 1e9,
  'Ω': 1,
  'kΩ': 1e3,
  'lines/mm': 1e3,
  'lines/cm': 1e2,
  'lines/m': 1,
  'm/s': 1,
  'km/s': 1e3,
};

/** A value in `unit` to SI; a unit not in the table (or none) takes `fallback` per unit. */
export const toSI = (x: number, unit: string | undefined, fallback = 1) =>
  x * (unit !== undefined && unit in UNITS ? UNITS[unit]! : fallback);

/** SI per unit of a unit the table knows. */
export const unitSI = (unit: string | undefined, fallback = 1) =>
  unit !== undefined && unit in UNITS ? UNITS[unit]! : fallback;

// ─── HC68 ────────────────────────────────────────────────────────────────────

/**
 * A single slit a wide (m) lit at λ (m): the dark fringes' angles (a sin θₘ = mλ, every m with
 * mλ < a) and the screen positions L tan θₘ, the central band w = 2L tan θ₁ (undefined with no
 * dark fringe: a ≤ λ).
 */
export function singleSlitOf(lambda: number, a: number, L: number) {
  const darks: { m: number; theta: number; y: number }[] = [];
  for (let m = 1; m * lambda < a && m <= 60; m++) {
    const theta = Math.asin((m * lambda) / a) / DEG;
    darks.push({ m, theta, y: L * Math.tan(theta * DEG) });
  }
  const first = darks[0];
  return { darks, theta1: first?.theta, central: first ? 2 * first.y : undefined };
}

/** Relative brightness at θ (degrees) behind a slit a wide at λ: sinc²(πa sin θ ÷ λ). */
export function slitBrightness(lambda: number, a: number, thetaDeg: number) {
  const b = (Math.PI * a * Math.sin(thetaDeg * DEG)) / lambda;
  return Math.abs(b) < 1e-9 ? 1 : (Math.sin(b) / b) ** 2;
}

/**
 * A grating of N lines per m at λ (m): d = 1 ÷ N, the orders with |mλ| < d (strictly under 90°)
 * and their angles, and m_max.
 */
export function gratingOf(lambda: number, N: number) {
  const d = 1 / N;
  const ratio = d / lambda;
  // The last order strictly under 90° (an exact ratio puts its last order at grazing, unseen).
  const highest = Math.max(0, Math.ceil(ratio - 1e-9) - 1);
  const orders = Array.from({ length: Math.min(highest, 200) + 1 }, (_, m) => ({
    m,
    theta: Math.asin((m * lambda) / d) / DEG,
  }));
  return { d, highest, orders };
}

/** The angle of order m (degrees), or undefined past sin θ = 1. */
export function gratingAngle(lambda: number, d: number, m: number) {
  const s = (m * lambda) / d;
  return Math.abs(s) >= 1 ? undefined : Math.asin(s) / DEG;
}

/**
 * The thin film's reflected bright wavelength for order m (m): 2nt = (m + ½)λ with one flip,
 * 2nt = mλ with both or neither (undefined at m = 0, no wavelength).
 */
export function thinFilmOf(n: number, t: number, m: number, flips: 'one' | 'both' | 'none') {
  const path = 2 * n * t;
  const k = flips === 'one' ? m + 0.5 : m;
  return { path, lambda: k > 0 ? path / k : undefined };
}

// ─── HC69 ────────────────────────────────────────────────────────────────────

/** A harmonic oscillator's state: H, (ẋ, ṗ) = (∂H/∂p, −∂H/∂x), ω, the ellipse's half-widths, 𝒜. */
export function oscillatorOf(m: number, k: number, x: number, p: number) {
  const H = (p * p) / (2 * m) + 0.5 * k * x * x;
  const omega = Math.sqrt(k / m);
  return {
    H,
    xdot: p / m,
    pdot: -k * x,
    omega,
    xHalf: Math.sqrt((2 * H) / k),
    pHalf: Math.sqrt(2 * m * H),
    area: (2 * Math.PI * H) / omega,
  };
}

/** A pendulum's E = ½mL²ω₀², E_s = 2mgL, and θ_max (degrees; undefined when it goes over). */
export function pendulumOf(m: number, L: number, omega0: number, g: number) {
  const E = 0.5 * m * L * L * omega0 * omega0;
  const Es = 2 * m * g * L;
  const c = 1 - E / (m * g * L);
  return { E, Es, thetaMax: E < Es ? Math.acos(Math.max(-1, c)) / DEG : undefined };
}

/** ω on the pendulum's curve of energy E at θ (degrees), or undefined where it can't reach. */
export function pendulumOmega(m: number, L: number, g: number, E: number, thetaDeg: number) {
  const ke = E - m * g * L * (1 - Math.cos(thetaDeg * DEG));
  return ke < 0 ? undefined : Math.sqrt((2 * ke) / (m * L * L));
}

/** A bead on a hoop: ω_c = √(g ÷ R), θ₀ (degrees) and the small-oscillation Ω. */
export function hoopOf(R: number, omega: number, g: number) {
  const wc = Math.sqrt(g / R);
  if (omega <= wc) return { wc, theta0: 0, Omega: Math.sqrt(wc * wc - omega * omega) };
  const c = g / (omega * omega * R);
  const theta0 = Math.acos(c) / DEG;
  return { wc, theta0, Omega: omega * Math.sin(theta0 * DEG) };
}

/** U_eff(θ) ÷ mgR on the hoop: 1 − cos θ − ½(ω ÷ ω_c)² sin² θ. */
export const hoopU = (ratio: number, thetaDeg: number) =>
  1 - Math.cos(thetaDeg * DEG) - 0.5 * ratio * ratio * Math.sin(thetaDeg * DEG) ** 2;

// ─── HC93 ────────────────────────────────────────────────────────────────────

/**
 * A plane wave of amplitude E₀ (V/m) at speed v (m/s): B₀ = E₀ ÷ v, the impedance η (given, or
 * μ₀v for a nonmagnetic medium), H₀ = E₀ ÷ η and the intensity E₀² ÷ 2η.
 */
export function emWaveOf(E0: number, v = LIGHT_SPEED, eta?: number) {
  const imp = eta ?? 4e-7 * Math.PI * v;
  return { B0: E0 / v, eta: imp, H0: E0 / imp, intensity: (E0 * E0) / (2 * imp) };
}

/** A line's Γ from Z₀ and R_L, and the VSWR, V_max and V_min (per |V⁺|) from Γ. */
export const gammaOf = (z0: number, rl: number) => (rl - z0) / (rl + z0);
export function standingOf(gamma: number) {
  const g = Math.min(1, Math.abs(gamma));
  return { vmax: 1 + g, vmin: 1 - g, vswr: g >= 1 ? Infinity : (1 + g) / (1 - g) };
}

/** |V(d)| ÷ |V⁺| at d wavelengths from the load, for a real Γ: |1 + Γe^(−j4πd)|. */
export const lineEnvelope = (gamma: number, d: number) =>
  Math.hypot(1 + gamma * Math.cos(4 * Math.PI * d), gamma * Math.sin(4 * Math.PI * d));
