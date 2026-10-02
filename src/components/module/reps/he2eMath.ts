/**
 * The physics of the college round 2 group E pictures (HC19 `induction` field sources and rails,
 * HC29 `charges` Gauss surfaces and continuous distributions), in SI. Pure: the pictures draw
 * from these and the harness (harness/picturesHe2e.ts) checks the pages' values against them.
 * Constants come from the page (`mu0`, `k` or `eps0`); these are only the defaults.
 */

/** μ₀ = 4π × 10⁻⁷ T·m/A, the plans' value. */
export const MU0 = 4 * Math.PI * 1e-7;
/** k = 8.99 × 10⁹ N·m²/C², the physics plan's value. */
export const K_DEFAULT = 8.99e9;

/** The page's electric constants: k, or ε₀, or the default k; the other from k = 1/(4πε₀). */
export function electricOf(o: { k?: number; eps0?: number }) {
  const k = o.k ?? (o.eps0 ? 1 / (4 * Math.PI * o.eps0) : K_DEFAULT);
  return { k, eps0: o.eps0 ?? 1 / (4 * Math.PI * k) };
}

// ─── HC19: field sources ──────────────────────────────────────────────────────

/** A long straight wire (radius `a` with even current, or thin): B at r, H = B/μ₀. */
export function wireField(mu0: number, I: number, r: number, a = 0) {
  if (!(r > 0)) return 0;
  return r < a ? (mu0 * I * r) / (2 * Math.PI * a * a) : (mu0 * I) / (2 * Math.PI * r);
}

/** Force per length between parallel wires r apart: + attracts (currents the same way). */
export const wireForce = (mu0: number, I1: number, I2: number, r: number) =>
  r > 0 ? (mu0 * I1 * I2) / (2 * Math.PI * r) : NaN;

/** A loop of N turns, radius R: B on its axis at z (Biot–Savart, sideways parts cancelled). */
export const loopAxial = (mu0: number, N: number, I: number, R: number, z: number) =>
  R > 0 ? (N * mu0 * I * R * R) / (2 * Math.sqrt(z * z + R * R) ** 3) : NaN;

/** A coil in a uniform field: moment, torque and energy. */
export function loopTorque(N: number, I: number, A: number, B: number, thetaDeg: number) {
  const mu = N * I * A;
  const th = (thetaDeg * Math.PI) / 180;
  return { mu, torque: mu * B * Math.sin(th), energy: -mu * B * Math.cos(th) };
}

/** A solenoid: n = N/ℓ, B = μ₀nI inside, L = μ₀N²A/ℓ, U = ½LI². */
export function solenoidOf(mu0: number, N: number, len: number, I: number, A?: number) {
  const n = len > 0 ? N / len : NaN;
  const L = A === undefined || !(len > 0) ? NaN : (mu0 * N * N * A) / len;
  return { n, B: mu0 * n * I, L, U: 0.5 * L * I * I };
}

/** A toroid: B = μ₀NI/(2πr) inside the windings, 0 outside (`inside` false). */
export const toroidField = (mu0: number, N: number, I: number, r: number, inside = true) =>
  inside && r > 0 ? (mu0 * N * I) / (2 * Math.PI * r) : 0;

/**
 * Round plates of radius R charging at I: dE/dt = I/(ε₀πR²) between them, the displacement
 * current inside r, I_d = I(r/R)² (all of I past the rim, unless `between`: the pages' rule
 * for r ≤ R, kept past it), and B = μ₀I_d/(2πr).
 */
export function platesOf(
  mu0: number,
  eps0: number,
  I: number,
  R: number,
  r: number,
  between = false,
) {
  const rate = R > 0 ? I / (eps0 * Math.PI * R * R) : NaN;
  const Id = r >= R && !between ? I : R > 0 ? I * (r / R) ** 2 : NaN;
  return { rate, Id, B: r > 0 ? (mu0 * Id) / (2 * Math.PI * r) : 0 };
}

/**
 * B in the meridian plane of a coaxial set of loops (radius R at axial positions zs, current I
 * each), summed by Biot–Savart over `seg` pieces per loop. Returns [B_ρ, B_z] at (ρ, z); the
 * pictures trace field lines from it. Units: whatever ρ, z, R are in (the direction is what
 * the lines need; the size is μ₀I/(4π) per unit length).
 */
export function loopsField(
  R: number,
  zs: number[],
  rho: number,
  z: number,
  seg = 48,
): [number, number] {
  let br = 0;
  let bz = 0;
  for (const z0 of zs) {
    for (let i = 0; i < seg; i++) {
      const a = ((i + 0.5) / seg) * 2 * Math.PI;
      const da = (2 * Math.PI) / seg;
      // The piece at (R cos a, R sin a, z0), dl = R da (−sin a, cos a, 0); field point (rho, 0, z).
      const dlx = -R * Math.sin(a) * da;
      const dly = R * Math.cos(a) * da;
      const rx = rho - R * Math.cos(a);
      const ry = -R * Math.sin(a);
      const rz = z - z0;
      const r3 = Math.hypot(rx, ry, rz) ** 3;
      if (r3 < 1e-12) continue;
      // dl × r
      br += (dly * rz) / r3;
      bz += (dlx * ry - dly * rx) / r3;
      // (the y part cancels round the loop)
    }
  }
  return [br, bz];
}

/**
 * A field line through (ρ₀, z₀) in the meridian plane, traced both ways with midpoint steps of
 * `step` until it leaves the box, comes back near its start or nears a wire (within `stop`).
 * Points are [ρ, z].
 */
export function traceMeridian(
  field: (rho: number, z: number) => [number, number],
  start: [number, number],
  box: { r0: number; r1: number; z0: number; z1: number },
  wires: [number, number][],
  step: number,
  stop: number,
  max = 600,
): [number, number][] {
  const dir = (p: [number, number]): [number, number] | undefined => {
    const [a, b] = field(p[0], p[1]);
    const n = Math.hypot(a, b);
    return n > 0 ? [a / n, b / n] : undefined;
  };
  const run = (sign: number) => {
    const pts: [number, number][] = [];
    let p = start;
    for (let i = 0; i < max; i++) {
      const d1 = dir(p);
      if (!d1) break;
      const mid: [number, number] = [
        p[0] + (sign * d1[0] * step) / 2,
        p[1] + (sign * d1[1] * step) / 2,
      ];
      const d2 = dir(mid);
      if (!d2) break;
      p = [p[0] + sign * d2[0] * step, p[1] + sign * d2[1] * step];
      pts.push(p);
      if (p[0] < box.r0 || p[0] > box.r1 || p[1] < box.z0 || p[1] > box.z1) break;
      if (wires.some(([wr, wz]) => Math.hypot(p[0] - wr, p[1] - wz) < stop)) break;
      if (i > 20 && Math.hypot(p[0] - start[0], p[1] - start[1]) < step * 0.9) {
        pts.push(start);
        return { pts, closed: true };
      }
    }
    return { pts, closed: false };
  };
  const fwd = run(1);
  if (fwd.closed) return [start, ...fwd.pts];
  const back = run(-1);
  return [...back.pts.reverse(), start, ...fwd.pts];
}

/** Evenly spaced start radii across a solenoid's middle (0 < ρ < R): the even field inside. */
export const solenoidStarts = (R: number, lines: number) =>
  Array.from({ length: lines }, (_, i) => ((i + 0.5) / lines) * R * 0.92);

// ─── HC19: rails ──────────────────────────────────────────────────────────────

/**
 * A rod of length L sliding at v on rails closed by R, in B square to the loop: ε = BLv,
 * I = ε/R, the force on the rod F = BIL against v (`forceSign` = −sign(v)), P = Fv = I²R.
 */
export function railsOf(B: number, L: number, v: number, R?: number) {
  const emf = B * L * v;
  const I = R === undefined || !(R > 0) ? NaN : emf / R;
  const F = Math.abs(B * I * L);
  return { emf, I, F, P: F * Math.abs(v), forceSign: v === 0 ? 0 : -Math.sign(v) };
}

// ─── HC29: Gauss surfaces ─────────────────────────────────────────────────────

export type GaussShape = 'sphere' | 'line' | 'plane';

/**
 * Gauss's law for the drawn surface. Sphere: charge Q in a solid ball of radius R (a point
 * charge without R), a sphere of radius r: Q_enc = Q(r/R)³ inside, E = kQ_enc/r², area 4πr².
 * Line: λ (C/m) on a rod (or a solid cylinder of radius R), a cylinder of radius r and length
 * `len`: Q_enc = λ·len (× (r/R)² inside), E = 2kλ_enc/r, area 2πr·len. Plane: σ (C/m²), a
 * pillbox of face area `len`²: Q_enc = σ·len², E = σ/(2ε₀), the faces' area 2·len².
 */
export function gaussOf(
  shape: GaussShape,
  o: { k: number; eps0: number },
  Q: number,
  r: number,
  R?: number,
  len = 1,
) {
  if (shape === 'sphere') {
    const enc = R !== undefined && r < R ? Q * (r / R) ** 3 : Q;
    return { enc, E: r > 0 ? (o.k * enc) / (r * r) : 0, area: 4 * Math.PI * r * r };
  }
  if (shape === 'line') {
    const lam = R !== undefined && r < R ? Q * (r / R) ** 2 : Q;
    return { enc: lam * len, E: r > 0 ? (2 * o.k * lam) / r : 0, area: 2 * Math.PI * r * len };
  }
  return { enc: Q * len * len, E: Q / (2 * o.eps0), area: 2 * len * len };
}

/** The flux Φ = Q_enc/ε₀ through the drawn surface. */
export const fluxOf = (enc: number, eps0: number) => enc / eps0;

// ─── HC29: continuous distributions ───────────────────────────────────────────

/** A ring of charge Q, radius R: V and E_z on its axis at z. */
export function ringOf(k: number, Q: number, R: number, z: number) {
  const s = Math.sqrt(z * z + R * R);
  return { V: s > 0 ? (k * Q) / s : NaN, E: s > 0 ? (k * Q * z) / s ** 3 : NaN };
}

/** A disk of σ (C/m²), radius R: E_z on its axis at z > 0 and the sheet limit 2πkσ. */
export function diskOf(k: number, sigma: number, R: number, z: number) {
  const sheet = 2 * Math.PI * k * sigma;
  const s = Math.sqrt(z * z + R * R);
  return { E: s > 0 ? sheet * (1 - z / s) : NaN, sheet };
}

/**
 * A charge q at height d over a grounded plane: its image −q at −d, the pull toward the plane
 * F = kq²/(2d)², the induced density under it σ₀ = −q/(2πd²) and σ at a distance x along the
 * plane, σ(x) = −qd/(2π(x² + d²)^(3/2)); the induced total is −q.
 */
export function imageOf(k: number, q: number, d: number) {
  return {
    image: -q,
    at: -d,
    F: d > 0 ? (k * q * q) / (2 * d) ** 2 : NaN,
    sigma0: d > 0 ? -q / (2 * Math.PI * d * d) : NaN,
    sigmaAt: (x: number) => (-q * d) / (2 * Math.PI * Math.sqrt(x * x + d * d) ** 3),
    total: -q,
  };
}
