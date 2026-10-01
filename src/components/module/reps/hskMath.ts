/**
 * The physics behind the group HK pictures (Grades 9–12), shared by the pictures and the
 * harness checks. SI units: m, s, m/s, kg, N; angles in degrees.
 */

export const G_EARTH = 9.8;

/** Launch components, flight time, range and top of a projectile (SI; θ in degrees). */
export function projectileOf(v: number, deg: number, h: number, g = G_EARTH) {
  const vx = v * Math.cos((deg * Math.PI) / 180);
  const vy = v * Math.sin((deg * Math.PI) / 180);
  const T = (vy + Math.sqrt(Math.max(0, vy * vy + 2 * g * h))) / g;
  return { vx, vy, T, R: vx * T, H: vy > 0 ? h + (vy * vy) / (2 * g) : h };
}

const RAD_M = Math.PI / 180;

/** Newton's gravitational constant, N·m²/kg². */
export const G_NEWTON = 6.674e-11;

/**
 * Where a planet is on a Kepler ellipse at mean anomaly M (radians from perihelion, growing
 * evenly with time): Kepler's equation M = E − e sin E solved for E by Newton's method, then
 * the position from the ellipse's center (the sun at (ae, 0), perihelion at (a, 0)).
 */
export function keplerPoint(a: number, e: number, M: number) {
  let E = e < 0.8 ? M : Math.PI;
  for (let i = 0; i < 40; i++) {
    const d = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-12) break;
  }
  const b = a * Math.sqrt(1 - e * e);
  return { x: a * Math.cos(E), y: b * Math.sin(E), E, r: a * (1 - e * Math.cos(E)) };
}

/** The area swept from the sun between mean anomalies M1 and M2 (shoelace over a fine path). */
export function sweptArea(a: number, e: number, M1: number, M2: number, n = 400) {
  const sun = { x: a * e, y: 0 };
  let area = 0;
  let prev = keplerPoint(a, e, M1);
  for (let i = 1; i <= n; i++) {
    const p = keplerPoint(a, e, M1 + ((M2 - M1) * i) / n);
    area += ((prev.x - sun.x) * (p.y - sun.y) - (p.x - sun.x) * (prev.y - sun.y)) / 2;
    prev = p;
  }
  return Math.abs(area);
}

/** A force on a free-body diagram, in newtons, x to the right and y up. */
export interface Force {
  key: 'weight' | 'normal' | 'friction' | 'tension' | 'applied';
  fx: number;
  fy: number;
}

/**
 * The forces on a block (H60). `floor`: weight, the normal force balancing what is not
 * lifted by an applied force or rope at their angles above level, and friction against the
 * horizontal pull. `incline` (rising to the right at θ): weight, the normal force mg cos θ, an
 * applied force or rope up the slope, friction along the slope against the rest. `hanging`: a
 * rope's tension up and the weight. Friction never exceeds what would stop the block: past
 * that it is static friction, equal to the rest (`isStatic`). A block already `moving` feels
 * kinetic friction of its full size against the motion.
 */
export function freeBodyOf(inp: {
  support: 'floor' | 'incline' | 'hanging';
  m: number;
  g: number;
  theta: number;
  F: number;
  phi: number;
  T: number;
  psi: number;
  f: number;
  /** Already sliding: +1 along the surface's + way (right; up the slope), −1 the other way. */
  moving?: 1 | -1;
}) {
  const { m, g, F, T } = inp;
  const W = m * g;
  const forces: Force[] = [{ key: 'weight', fx: 0, fy: -W }];
  let N = 0;
  let fUsed = 0;
  let isStatic = false;
  let driving = 0;
  const friction = (ux: number, uy: number) => {
    // Sliding: kinetic friction, its full size against the motion. At rest: at most what
    // holds the block (static), against the rest of the forces.
    fUsed = inp.moving ? Math.max(0, inp.f) : Math.min(Math.max(0, inp.f), Math.abs(driving));
    isStatic = !inp.moving && inp.f > 0 && inp.f >= Math.abs(driving);
    const sgn = inp.moving ? -inp.moving : -Math.sign(driving);
    if (fUsed) forces.push({ key: 'friction', fx: sgn * fUsed * ux, fy: sgn * fUsed * uy });
  };
  if (inp.support === 'hanging') {
    forces.push({ key: 'tension', fx: 0, fy: T });
  } else if (inp.support === 'floor') {
    const [cp, sp] = [Math.cos(inp.phi * RAD_M), Math.sin(inp.phi * RAD_M)];
    const [cq, sq] = [Math.cos(inp.psi * RAD_M), Math.sin(inp.psi * RAD_M)];
    if (F) forces.push({ key: 'applied', fx: F * cp, fy: F * sp });
    if (T) forces.push({ key: 'tension', fx: T * cq, fy: T * sq });
    N = Math.max(0, W - F * sp - T * sq);
    driving = F * cp + T * cq;
    forces.push({ key: 'normal', fx: 0, fy: N });
    friction(1, 0);
  } else {
    const [c, s] = [Math.cos(inp.theta * RAD_M), Math.sin(inp.theta * RAD_M)];
    N = W * c;
    forces.push({ key: 'normal', fx: -s * N, fy: c * N });
    if (F) forces.push({ key: 'applied', fx: F * c, fy: F * s });
    if (T) forces.push({ key: 'tension', fx: T * c, fy: T * s });
    driving = F + T - W * s;
    friction(c, s);
  }
  const sum = forces.reduce((a, q) => ({ x: a.x + q.fx, y: a.y + q.fy }), { x: 0, y: 0 });
  // Rounding leaves crumbs: a balanced direction is exactly 0.
  const tidy = (x: number) => (Math.abs(x) < 1e-9 * Math.max(1, W, F, T) ? 0 : x);
  const net = { x: tidy(sum.x), y: tidy(sum.y) };
  return { W, N, fUsed, isStatic, driving, forces, net, netSize: Math.hypot(net.x, net.y) };
}

/**
 * Velocities after a collision on a line (+ to the right). `stick`: one shared velocity.
 * `elastic`: momentum and kinetic energy both kept. `explode`: the pair moving together at
 * v₁ splits, the first cart leaving at `first`; the second's velocity keeps the momentum.
 */
export function collisionOf(
  type: 'stick' | 'elastic' | 'explode' | 'general',
  m1: number,
  m2: number,
  v1: number,
  v2: number,
  first = 0,
): [number, number] {
  const M = m1 + m2;
  if (!(M > 0)) return [0, 0];
  if (type === 'stick') {
    const v = (m1 * v1 + m2 * v2) / M;
    return [v, v];
  }
  if (type === 'elastic')
    return [((m1 - m2) * v1 + 2 * m2 * v2) / M, ((m2 - m1) * v2 + 2 * m1 * v1) / M];
  // General: the first cart's velocity after is given, the second's from the momentum.
  if (type === 'general') return [first, m2 > 0 ? (m1 * v1 + m2 * v2 - m1 * first) / m2 : 0];
  return [first, m2 > 0 ? (M * v1 - m1 * first) / m2 : 0];
}

/**
 * A standing wave of harmonic n in a length L (H65): its wavelength, and the nodes and
 * antinodes as fractions of L (pipes: the air's displacement). A closed pipe has odd n only.
 */
export function standingOf(medium: 'string' | 'open' | 'closed', n: number, L: number) {
  const whole = Number.isInteger(n) && n >= 1;
  const valid = whole && (medium !== 'closed' || n % 2 === 1);
  const lambda = medium === 'closed' ? (4 * L) / n : (2 * L) / n;
  const upTo = (step: number, start: number) => {
    const out: number[] = [];
    for (let x = start; x <= 1 + 1e-9; x += step) out.push(Number(x.toFixed(12)));
    return out;
  };
  const h = 1 / n;
  const nodes =
    medium === 'string' ? upTo(h, 0) : medium === 'open' ? upTo(h, h / 2) : upTo(2 * h, 0);
  const antinodes =
    medium === 'string' ? upTo(h, h / 2) : medium === 'open' ? upTo(h, 0) : upTo(2 * h, h);
  return { valid, lambda, nodes: valid ? nodes : [], antinodes: valid ? antinodes : [] };
}

/**
 * A thin lens or mirror (H66): f is positive for a converging lens or concave mirror and
 * negative for a diverging lens or convex mirror; 1/f = 1/dₒ + 1/dᵢ gives dᵢ (+ real, − virtual;
 * infinite with the object at the focal point), m = −dᵢ/dₒ and hᵢ = m hₒ.
 */
export function thinLensOf(
  shape: 'converging' | 'diverging' | 'concave' | 'convex',
  focal: number,
  dO: number,
  hO: number,
) {
  const f = shape === 'converging' || shape === 'concave' ? focal : -focal;
  const inv = 1 / f - 1 / dO;
  const dI = Math.abs(inv) < 1e-12 ? Infinity : 1 / inv;
  const m = Number.isFinite(dI) ? -dI / dO : Infinity;
  return { f, dI, m, hI: m * hO };
}

/** Snell's law n₁ sin θ₁ = n₂ sin θ₂ (degrees); past the critical angle, total reflection. */
export function snellOf(n1: number, n2: number, deg: number) {
  const s = (n1 * Math.sin((deg * Math.PI) / 180)) / n2;
  const critical = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : undefined;
  return {
    refracted: Math.abs(s) <= 1 ? (Math.asin(s) * 180) / Math.PI : undefined,
    critical,
    total: Math.abs(s) > 1,
  };
}

/** Double-slit fringe spacing Δy = λL/d, with λ in nm, d in mm, L in m: Δy in mm. */
export const fringeOf = (nm: number, mm: number, m: number) => (mm > 0 ? (nm * m) / mm / 1000 : 0);

/**
 * Three resistors on a battery (H68): R₁ in series with R₂ ∥ R₃, or (R₁ + R₂) ∥ R₃. The
 * equivalent resistance, the total current, and each resistor's voltage, current and power.
 */
export function mixedOf(
  layout: 'seriesParallel' | 'parallelSeries',
  [R1, R2, R3]: [number, number, number],
  V: number,
) {
  if (layout === 'seriesParallel') {
    const R23 = (R2 * R3) / (R2 + R3);
    const Req = R1 + R23;
    const I = V / Req;
    const V23 = I * R23;
    const Vs = [I * R1, V23, V23] as const;
    const Is = [I, V23 / R2, V23 / R3] as const;
    return { Req, I, V: Vs, I3: Is, P: [Vs[0] * Is[0], Vs[1] * Is[1], Vs[2] * Is[2]] as const };
  }
  const R12 = R1 + R2;
  const Req = (R12 * R3) / (R12 + R3);
  const I = V / Req;
  const I12 = V / R12;
  const Vs = [I12 * R1, I12 * R2, V] as const;
  const Is = [I12, I12, V / R3] as const;
  return { Req, I, V: Vs, I3: Is, P: [Vs[0] * Is[0], Vs[1] * Is[1], Vs[2] * Is[2]] as const };
}

/**
 * Visible spectral lines (nm, in air, from the standard atomic tables) with their names, the
 * reference line first: hydrogen's Balmer series (Hα to Hδ), helium's brightest visible lines,
 * sodium's D doublet and its weaker lines.
 */
export const SPECTRAL_LINES: Record<'H' | 'He' | 'Na', { nm: number; name: string }[]> = {
  H: [
    { nm: 656.3, name: 'Hα' },
    { nm: 486.1, name: 'Hβ' },
    { nm: 434.0, name: 'Hγ' },
    { nm: 410.2, name: 'Hδ' },
  ],
  He: [
    { nm: 587.6, name: '587.6' },
    { nm: 447.1, name: '447.1' },
    { nm: 471.3, name: '471.3' },
    { nm: 492.2, name: '492.2' },
    { nm: 501.6, name: '501.6' },
    { nm: 667.8, name: '667.8' },
    { nm: 706.5, name: '706.5' },
  ],
  Na: [
    { nm: 589.0, name: 'D₂' },
    { nm: 589.6, name: 'D₁' },
    { nm: 568.8, name: '568.8' },
    { nm: 615.4, name: '615.4' },
  ],
};

/** Planck's constant (J·s), the speed of light (m/s) and the electronvolt (J). */
export const H_PLANCK = 6.626e-34;
export const C_LIGHT = 3e8;
export const EV = 1.602e-19;

/** A photon of frequency f (Hz): its wavelength in nm and its energy in J and eV. */
export const photonOf = (f: number) => ({
  nm: f > 0 ? (C_LIGHT / f) * 1e9 : Infinity,
  J: H_PLANCK * f,
  eV: (H_PLANCK * f) / EV,
});

/** Coulomb's constant, N·m²/C². */
export const K_COULOMB = 8.99e9;

/** The force between two charges in μC r m apart (N, the size), and whether they repel. */
export const coulombOf = (q1: number, q2: number, r: number) => ({
  F: r > 0 ? (K_COULOMB * Math.abs(q1 * 1e-6 * q2 * 1e-6)) / (r * r) : Infinity,
  repel: q1 * q2 > 0,
});

/** The field of a charge in μC at r m (N/C, the size). */
export const fieldOf = (q: number, r: number) =>
  r > 0 ? (K_COULOMB * Math.abs(q * 1e-6)) / (r * r) : Infinity;

/** The Doppler frequencies for a source moving at vₛ through still air (observers at rest). */
export const dopplerOf = (f: number, v: number, vs: number) => ({
  ahead: v > vs ? (f * v) / (v - vs) : Infinity,
  behind: (f * v) / (v + vs),
});

/**
 * A heat engine's flows (J) and efficiency, or a refrigerator's. Engine: Q_C = Q_H − W,
 * e = W/Q_H, Carnot 1 − T_C/T_H. Refrigerator: Q_H = Q_C + W, COP = Q_C/W, Carnot COP
 * T_C/(T_H − T_C).
 */
export function heatEngineOf(
  mode: 'engine' | 'refrigerator',
  heat: number,
  W: number,
  TH: number,
  TC: number,
) {
  if (mode === 'engine')
    return {
      QH: heat,
      QC: heat - W,
      W,
      e: heat > 0 ? W / heat : 0,
      carnot: TH > 0 ? 1 - TC / TH : 0,
    };
  return {
    QH: heat + W,
    QC: heat,
    W,
    e: W > 0 ? heat / W : 0,
    carnot: TH > TC ? TC / (TH - TC) : Infinity,
  };
}

/**
 * A simple machine's ideal mechanical advantage (lever: effort arm ÷ load arm; pulley: the
 * supporting strands; ramp: length ÷ height) and the effort that lifts `load` at `efficiency`
 * percent (100: ideal).
 */
export function machineOf(inp: {
  machine: 'lever' | 'pulley' | 'incline';
  load: number;
  effortArm: number;
  loadArm: number;
  strands: number;
  length: number;
  height: number;
  efficiency: number;
}) {
  const ima =
    inp.machine === 'lever'
      ? inp.loadArm > 0
        ? inp.effortArm / inp.loadArm
        : 0
      : inp.machine === 'pulley'
        ? inp.strands
        : inp.height > 0
          ? inp.length / inp.height
          : 0;
  const eff = inp.efficiency / 100;
  return { ima, effort: ima > 0 && eff > 0 ? inp.load / (ima * eff) : 0 };
}

/**
 * The field of charges q₁ (at 0) and q₂ (at r), in μC, at a point x m along their line (H102):
 * each charge's part and the sum, signed + toward larger x (N/C).
 */
export function fieldAtPoint(q1: number, q2: number, r: number, x: number) {
  const part = (q: number, d: number) =>
    Math.abs(d) < 1e-12 ? NaN : (K_COULOMB * q * 1e-6 * Math.sign(d)) / (d * d);
  const E1 = part(q1, x);
  const E2 = part(q2, x - r);
  return { E1, E2, E: E1 + E2 };
}
