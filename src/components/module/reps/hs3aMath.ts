/**
 * The physics the group-H3A pictures draw (H107), shared with their harness checks
 * (`harness/picturesHs3a.ts`). Plain SI unless a name says otherwise.
 */

/** Degrees to radians. */
const RAD = Math.PI / 180;

/** Coulomb's constant, N·m²/C², as the pages write it. */
export const K_E = 8.99e9;
/** The permittivity of free space, F/m, to the pages' three figures. */
export const EPSILON_0 = 8.85e-12;
/** The electron charge, C (and the joules in 1 eV). */
export const E_CHARGE = 1.602e-19;
/** Electron and proton masses, kg. */
export const M_ELECTRON = 9.109e-31;
export const M_PROTON = 1.673e-27;
/** Light's speed, m/s. */
export const C_LIGHT = 3e8;

/** τ = rF sin θ and its parts (θ in degrees, between the arm and the force). */
export const torqueOf = (r: number, F: number, deg: number) => {
  const across = F * Math.sin(deg * RAD);
  return { across, along: F * Math.cos(deg * RAD), torque: r * across };
};

/** A turning body: I = cmr², α = τ/I. */
export const inertiaOf = (c: number, m: number, r: number) => c * m * r * r;

/** Steady angular acceleration from ω₀: ω, the angle swept (rad) and the turns. */
export const spinUpOf = (w0: number, a: number, t: number) => {
  const angle = w0 * t + 0.5 * a * t * t;
  return { speed: w0 + a * t, angle, turns: angle / (2 * Math.PI) };
};

/** Turning at N rpm: ω (rad/s), the period (s) and the rim speed at radius r. */
export const steadyOf = (rpm: number, r: number) => {
  const w = (2 * Math.PI * rpm) / 60;
  return { w, period: w > 0 ? (2 * Math.PI) / w : Infinity, rim: r * w };
};

/** A mass on a spring: T, f, ω, v_max and E; the potential and kinetic energy at x. */
export const springOf = (m: number, k: number, A: number, x = A / 2) => {
  const w = m > 0 && k > 0 ? Math.sqrt(k / m) : NaN;
  const E = 0.5 * k * A * A;
  const U = 0.5 * k * x * x;
  return { w, T: (2 * Math.PI) / w, f: w / (2 * Math.PI), top: A * w, E, U, K: E - U };
};

/** A simple pendulum's period and frequency (small swings). */
export const pendulumOf = (L: number, g: number) => {
  const T = L >= 0 && g > 0 ? 2 * Math.PI * Math.sqrt(L / g) : NaN;
  return { T, f: 1 / T };
};

/**
 * A capacitor: Q = CV and U = ½CV² with C in units of `farads` (Q then in coulombs of the
 * same prefix), and C from its plates, κε₀A/d, in those units (d in meters).
 */
export const capacitorOf = (C: number, V: number, farads = 1) => ({
  Q: C * V,
  U: 0.5 * C * farads * V * V,
});
export const plateCapacitance = (kappa: number, A: number, dMeters: number, farads = 1) =>
  dMeters > 0 ? (kappa * EPSILON_0 * A) / dMeters / farads : Infinity;

/** A point charge (μC) r m away: its potential (V). */
export const potentialOf = (q: number, r: number) => (r > 0 ? (K_E * q * 1e-6) / r : Infinity);

/** A charge of n e let go through ΔV: K (eV) and its speed (m/s) for mass m (kg). */
export const launchOf = (n: number, dV: number, m: number) => {
  const K = n * dV;
  const v = K >= 0 && m > 0 ? Math.sqrt((2 * K * E_CHARGE) / m) : NaN;
  return { K, v };
};

/** The magnetic force on a moving charge (C) and, square to the field, its circle's radius. */
export const magneticOf = (q: number, v: number, B: number, deg = 90, m?: number) => ({
  F: Math.abs(q) * v * B * Math.sin(deg * RAD),
  r: m === undefined || !(Math.abs(q) * B > 0) ? NaN : (m * v) / (Math.abs(q) * B),
});
