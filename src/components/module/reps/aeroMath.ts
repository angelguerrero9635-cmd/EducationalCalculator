/**
 * The sums behind the college aero pictures (round 2, group H): HC24 `wing`, HC30 `duct` and
 * HC31 `supersonicFlow`. Everything is computed from the public relations (the NACA four-digit
 * equations, thin-airfoil theory, the isentropic, normal-shock, θ–β–M and Prandtl–Meyer
 * relations); no chart or table is copied. Shared by the pictures, the harness and the demos.
 * γ is always passed in: the page owns its constants.
 */

const DEG = Math.PI / 180;
export const toRad = (d: number) => d * DEG;
export const toDeg = (r: number) => r / DEG;

/** Bisection for f(x) = 0 on [a, b] where f changes sign; undefined when it doesn't. */
export function bisect(
  f: (x: number) => number,
  a: number,
  b: number,
  n = 200,
): number | undefined {
  let fa = f(a);
  const fb = f(b);
  if (!Number.isFinite(fa) || !Number.isFinite(fb) || fa * fb > 0) return undefined;
  if (fa === 0) return a;
  if (fb === 0) return b;
  for (let k = 0; k < n; k++) {
    const m = (a + b) / 2;
    const fm = f(m);
    if (fm === 0 || b - a < 1e-14 * Math.max(1, Math.abs(m))) return m;
    if (fa * fm < 0) b = m;
    else {
      a = m;
      fa = fm;
    }
  }
  return (a + b) / 2;
}

// ─── HC24: airfoils and wings ────────────────────────────────────────────────

/** A NACA four-digit section: max camber m and its place p (fractions of the chord), thickness t. */
export interface Naca {
  m: number;
  p: number;
  t: number;
}

export const nacaOf = (d1: number, d2: number, d34: number): Naca => ({
  m: d1 / 100,
  p: d2 / 10,
  t: d34 / 100,
});

/** The camber line's height y_c ÷ c at x ÷ c (NACA four-digit equations). */
export function camber({ m, p }: Naca, x: number): number {
  if (m <= 0 || p <= 0 || p >= 1) return 0;
  return x < p
    ? (m / (p * p)) * (2 * p * x - x * x)
    : (m / ((1 - p) * (1 - p))) * (1 - 2 * p + 2 * p * x - x * x);
}

/** The camber line's slope dy_c ÷ dx. */
export function camberSlope({ m, p }: Naca, x: number): number {
  if (m <= 0 || p <= 0 || p >= 1) return 0;
  return x < p ? ((2 * m) / (p * p)) * (p - x) : ((2 * m) / ((1 - p) * (1 - p))) * (p - x);
}

/** The half-thickness y_t ÷ c at x ÷ c (NACA four-digit thickness, open trailing edge). */
export function halfThickness(t: number, x: number): number {
  const s = Math.max(0, x);
  return (
    5 * t * (0.2969 * Math.sqrt(s) - 0.126 * s - 0.3516 * s * s + 0.2843 * s ** 3 - 0.1015 * s ** 4)
  );
}

/**
 * The section outline in chord fractions: upper surface from the trailing edge to the nose, then
 * the lower surface back (the thickness laid off normal to the camber line). Cosine spacing.
 */
export function nacaOutline(n: Naca, points = 48): [number, number][] {
  const upper: [number, number][] = [];
  const lower: [number, number][] = [];
  for (let k = 0; k <= points; k++) {
    const x = (1 - Math.cos((Math.PI * k) / points)) / 2;
    const yc = camber(n, x);
    const yt = halfThickness(n.t, x);
    const th = Math.atan(camberSlope(n, x));
    upper.push([x - yt * Math.sin(th), yc + yt * Math.cos(th)]);
    lower.push([x + yt * Math.sin(th), yc - yt * Math.cos(th)]);
  }
  return [...upper.reverse(), ...lower.slice(1)];
}

/**
 * Thin-airfoil zero-lift angle α_L0 (radians) of a camber line:
 * α_L0 = −(1 ÷ π) ∫₀^π (dy_c ÷ dx)(cos θ − 1) dθ, x = (1 − cos θ) ÷ 2. Midpoint rule.
 */
export function zeroLiftAngle(n: Naca, steps = 2000): number {
  let s = 0;
  for (let k = 0; k < steps; k++) {
    const th = ((k + 0.5) * Math.PI) / steps;
    s += camberSlope(n, (1 - Math.cos(th)) / 2) * (Math.cos(th) - 1);
  }
  return (-s * (Math.PI / steps)) / Math.PI;
}

/**
 * The camber a page's zero-lift angle asks for, at the camber place p: α_L0 is in proportion to
 * m for a given p, so m = 0.02 × α_L0 ÷ α_L0(2%, p). Clamped to 0–9.5% (a four-digit section).
 */
export function camberForZeroLift(alphaL0Deg: number, p = 0.4): number {
  if (!(alphaL0Deg < 0)) return 0;
  const per = toDeg(zeroLiftAngle({ m: 0.02, p, t: 0.12 }));
  return Math.min(0.095, (0.02 * alphaL0Deg) / per);
}

/** Lifting-line sums: induced drag coefficient and induced angle (radians). */
export const inducedDrag = (CL: number, AR: number, e: number) => (CL * CL) / (Math.PI * e * AR);
export const inducedAngle = (CL: number, AR: number) => CL / (Math.PI * AR);

/** Area and aspect ratio of a straight-tapered planform. */
export const taperedArea = (b: number, cr: number, ct: number) => (b * (cr + ct)) / 2;

// ─── HC30 and HC31: compressible flow ────────────────────────────────────────

/** T₀ ÷ T, p₀ ÷ p and ρ₀ ÷ ρ at Mach M (isentropic, calorically perfect). */
export const tRatio = (M: number, g: number) => 1 + ((g - 1) / 2) * M * M;
export const pRatio = (M: number, g: number) => tRatio(M, g) ** (g / (g - 1));
export const rhoRatio = (M: number, g: number) => tRatio(M, g) ** (1 / (g - 1));

/** The area–Mach relation, A ÷ A*. */
export function areaRatio(M: number, g: number): number {
  return (1 / M) * ((2 / (g + 1)) * tRatio(M, g)) ** ((g + 1) / (2 * (g - 1)));
}

/** M from A ÷ A* on one branch (undefined below 1, where no flow fits). */
export function machFromArea(A: number, g: number, branch: 'sub' | 'super'): number | undefined {
  if (!(A >= 1)) return undefined;
  if (Math.abs(A - 1) < 1e-12) return 1;
  const f = (M: number) => areaRatio(M, g) - A;
  return branch === 'sub' ? bisect(f, 1e-7, 1) : bisect(f, 1, 200);
}

/** The choked mass-flow factor: ṁ = k p₀A* ÷ √(RT₀), k = √γ (2 ÷ (γ + 1))^((γ + 1) ÷ (2(γ − 1))). */
export const chokedFactor = (g: number) =>
  Math.sqrt(g) * (2 / (g + 1)) ** ((g + 1) / (2 * (g - 1)));

/** Normal shock: M₂ and the ratios across it, from M₁ ≥ 1. */
export function normalShock(M1: number, g: number) {
  const m2 = M1 * M1;
  const M2 = Math.sqrt((1 + ((g - 1) / 2) * m2) / (g * m2 - (g - 1) / 2));
  const p = 1 + ((2 * g) / (g + 1)) * (m2 - 1);
  const rho = ((g + 1) * m2) / ((g - 1) * m2 + 2);
  const T = p / rho;
  // p₀₂ ÷ p₀₁ = (p₂ ÷ p₁)(p₀₂ ÷ p₂) ÷ (p₀₁ ÷ p₁).
  const p0 = (p * pRatio(M2, g)) / pRatio(M1, g);
  return { M2, p, rho, T, p0 };
}

/** The Rayleigh pitot formula: p₀₂ ÷ p₁ behind the probe's bow shock, M₁ > 1. */
export function pitotRatio(M1: number, g: number): number {
  const s = normalShock(M1, g);
  return s.p * pRatio(s.M2, g);
}

/** The Mach angle μ = sin⁻¹(1 ÷ M), radians (undefined below M = 1). */
export const machAngle = (M: number) => (M >= 1 ? Math.asin(1 / M) : undefined);

/** θ from β and M₁ (radians): tan θ = 2 cot β (M₁² sin²β − 1) ÷ (M₁²(γ + cos 2β) + 2). */
export function deflection(M1: number, beta: number, g: number): number {
  const s = Math.sin(beta);
  const num = 2 * (M1 * M1 * s * s - 1);
  const den = Math.tan(beta) * (M1 * M1 * (g + Math.cos(2 * beta)) + 2);
  return Math.atan(num / den);
}

/** The shock angle of the largest deflection, radians. */
export function maxDeflectionAngle(M1: number, g: number): number {
  const mu = machAngle(M1) ?? Math.PI / 2;
  let best = mu;
  let top = -Infinity;
  for (let k = 0; k <= 2000; k++) {
    const b = mu + ((Math.PI / 2 - mu) * k) / 2000;
    const th = deflection(M1, b, g);
    if (th > top) {
      top = th;
      best = b;
    }
  }
  return best;
}

/** The weak (or strong) shock angle β for a deflection θ (radians); undefined past θ_max. */
export function shockAngle(
  M1: number,
  theta: number,
  g: number,
  strong = false,
): number | undefined {
  const mu = machAngle(M1);
  if (mu === undefined) return undefined;
  const bMax = maxDeflectionAngle(M1, g);
  const f = (b: number) => deflection(M1, b, g) - theta;
  return strong ? bisect(f, bMax, Math.PI / 2) : bisect(f, mu, bMax);
}

/** The oblique shock from M₁ and β (radians): normal Mach numbers, ratios and M₂. */
export function obliqueShock(M1: number, beta: number, g: number) {
  const theta = deflection(M1, beta, g);
  const Mn1 = M1 * Math.sin(beta);
  const n = normalShock(Mn1, g);
  return { theta, Mn1, Mn2: n.M2, p: n.p, rho: n.rho, T: n.T, M2: n.M2 / Math.sin(beta - theta) };
}

/** The Prandtl–Meyer function ν(M), radians. */
export function prandtlMeyer(M: number, g: number): number {
  if (M < 1) return NaN;
  const k = Math.sqrt((g + 1) / (g - 1));
  const r = Math.sqrt(M * M - 1);
  return k * Math.atan(r / k) - Math.atan(r);
}

/** M from ν (radians), the inverse of the Prandtl–Meyer function. */
export function machFromNu(nu: number, g: number): number | undefined {
  if (nu < 0) return undefined;
  if (nu === 0) return 1;
  return bisect((M) => prandtlMeyer(M, g) - nu, 1, 500);
}

/** Ackeret's thin-airfoil lift and wave-drag coefficients of a flat plate at α (radians). */
export const ackeretLift = (M: number, alpha: number) => (4 * alpha) / Math.sqrt(M * M - 1);
export const ackeretDrag = (M: number, alpha: number) => (4 * alpha * alpha) / Math.sqrt(M * M - 1);

// ─── HC30: a nozzle's contour ────────────────────────────────────────────────

/**
 * A converging–diverging contour as A ÷ A* along s from 0 (the reservoir end) to 1 (the exit):
 * a cosine fair from `inlet` down to the throat at `throat`, then up to `exit`. A converging
 * duct (exit 1 or less than the inlet with no diverging part) ends at the throat.
 */
export function contourArea(s: number, inlet: number, exit: number, throat: number): number {
  if (s <= throat) {
    const u = s / throat;
    return 1 + (inlet - 1) * ((1 + Math.cos(Math.PI * u)) / 2);
  }
  const u = (s - throat) / (1 - throat);
  return 1 + (exit - 1) * ((1 - Math.cos(Math.PI * u)) / 2);
}

/** Where along the contour (s) the area is A on the converging (sub) or diverging (super) side. */
export function contourAt(
  A: number,
  inlet: number,
  exit: number,
  throat: number,
  side: 'sub' | 'super',
): number | undefined {
  if (A < 1) return undefined;
  if (side === 'sub') {
    if (A > inlet) return undefined;
    return bisect((s) => contourArea(s, inlet, exit, throat) - A, 0, throat);
  }
  if (A > exit) return undefined;
  return bisect((s) => contourArea(s, inlet, exit, throat) - A, throat, 1);
}

/**
 * M along a choked nozzle at area A ÷ A* (`side` of the throat), with a normal shock standing
 * where A ÷ A* = `shockAt` on the diverging side: past it the flow is subsonic with the new
 * A* (A*₂ = A* ÷ (p₀₂ ÷ p₀₁)). Returns M and p ÷ p₀₁.
 */
export function nozzleState(
  A: number,
  side: 'sub' | 'super',
  g: number,
  shockAt?: number,
): { M: number; p: number } | undefined {
  if (side === 'sub' || shockAt === undefined || A < shockAt) {
    const M = machFromArea(A, g, side);
    return M === undefined ? undefined : { M, p: 1 / pRatio(M, g) };
  }
  const M1 = machFromArea(shockAt, g, 'super');
  if (M1 === undefined) return undefined;
  const ratio = normalShock(M1, g).p0;
  const M = machFromArea(A * ratio, g, 'sub');
  return M === undefined ? undefined : { M, p: ratio / pRatio(M, g) };
}

/** The ideal exhaust speed: v_e = √((2γRT_c ÷ (γ − 1))(1 − (p_e ÷ p_c)^((γ − 1) ÷ γ))). */
export const exhaustSpeed = (g: number, R: number, Tc: number, pr: number) =>
  Math.sqrt(((2 * g * R * Tc) / (g - 1)) * (1 - pr ** ((g - 1) / g)));

// ─── HC24: the drawing's geometry (shared with the harness) ──────────────────

/**
 * A section tilted by α (degrees) against a wind from the left, in screen coordinates (y down):
 * the chord's direction from the leading edge, the wind's, and the lift's (⟂ the wind, up for
 * positive lift).
 */
export function sectionVectors(alphaDeg: number) {
  const a = toRad(alphaDeg);
  return {
    chord: [Math.cos(a), Math.sin(a)] as const,
    up: [Math.sin(a), -Math.cos(a)] as const,
    wind: [1, 0] as const,
    lift: [0, -1] as const,
  };
}

/**
 * A planform to scale in px: span b, root and tip chords, the scale (px per unit) fitting
 * `maxSpan` × `maxChord`; area and aspect ratio as drawn.
 */
export function planformBox(b: number, cr: number, ct: number, maxSpan = 300, maxChord = 104) {
  const s = Math.min(maxSpan / b, maxChord / cr);
  const span = b * s;
  const root = cr * s;
  const tip = ct * s;
  const area = (span * (root + tip)) / 2;
  return { scale: s, span, root, tip, area, aspect: (span * span) / area };
}

// ─── HC30: the duct's shape (shared with the harness) ────────────────────────

/** A duct's outline: inlet and exit A ÷ A*, where the throat is (0–1) and how it ends. */
export interface DuctShape {
  inlet: number;
  exit: number;
  throat: number;
  /** `cd`: converging–diverging; `converging`: ends at its exit (A* dashed beyond a subsonic one). */
  form: 'cd' | 'converging';
  /** Where the station is along the duct (0–1). */
  station: number;
}

/**
 * The shape for a station at A ÷ A* = `A`: a supersonic station ends a converging–diverging
 * duct at its exit; M = 1 ends a converging duct at the throat; a subsonic station sits at
 * the place of a converging duct where A ÷ A* = `A`, its throat A* (s = 1) dashed beyond it.
 */
export function ductShape(A: number, side: 'sub' | 'super' | 'sonic'): DuctShape {
  if (side === 'super') return { inlet: 3, exit: A, throat: 0.38, form: 'cd', station: 1 };
  if (side === 'sonic') return { inlet: 3, exit: 1, throat: 1, form: 'converging', station: 1 };
  const inlet = Math.max(3, A * 1.6);
  const station = contourAt(A, inlet, 1, 1, 'sub') ?? 0.75;
  return { inlet, exit: 1, throat: 1, form: 'converging', station };
}

/** A ÷ A* along a duct shape at s (0 inlet, 1 exit or the dashed A*). */
export const ductArea = (shape: DuctShape, s: number) =>
  contourArea(s, shape.inlet, shape.exit, shape.throat);

/** The throat's half-height in px, so that the widest section is `maxHalf`. */
export const throatHalf = (shape: DuctShape, maxHalf = 50) =>
  maxHalf / Math.sqrt(Math.max(shape.inlet, shape.exit));

/** Turbojet thrust and propulsive efficiency. */
export const jetThrust = (mdot: number, V0: number, Ve: number) => mdot * (Ve - V0);
export const propulsiveEfficiency = (V0: number, Ve: number) => 2 / (1 + Ve / V0);

// ─── HC31: wave geometry (shared with the harness); angles in radians, math axes (y up) ──

/** One Mach line of a fan: the flow's direction and Mach number there, and the line's angle. */
export interface FanRay {
  M: number;
  dir: number;
  angle: number;
}

/**
 * A centred expansion fan: flow at Mach M in direction d0 turning clockwise (down) by θ, as n + 1
 * Mach lines, the first at d0 + μ₁, the last at d0 − θ + μ₂ (ν rises by exactly θ across it).
 * Undefined when M < 1 or the turn passes the largest ν.
 */
export function expansionFan(
  M: number,
  d0: number,
  theta: number,
  g: number,
  n = 6,
): FanRay[] | undefined {
  if (!(M >= 1) || theta < 0) return undefined;
  const nu1 = prandtlMeyer(M, g);
  const rays: FanRay[] = [];
  for (let k = 0; k <= n; k++) {
    const turn = (theta * k) / n;
    const Mk = machFromNu(nu1 + turn, g);
    if (Mk === undefined) return undefined;
    const dir = d0 - turn;
    rays.push({ M: Mk, dir, angle: dir + Math.asin(1 / Mk) });
  }
  return rays;
}

/**
 * An attached oblique shock: flow at M in direction d0 turned anticlockwise (up) by θ. The shock
 * line's angle is d0 + β (weak branch); undefined past the largest deflection.
 */
export function obliqueLine(M: number, d0: number, theta: number, g: number) {
  if (!(M > 1)) return undefined;
  const beta = theta === 0 ? Math.asin(1 / M) : shockAngle(M, theta, g);
  if (beta === undefined) return undefined;
  const o = obliqueShock(M, beta, g);
  return { beta, angle: d0 + beta, M2: theta === 0 ? M : o.M2, p: theta === 0 ? 1 : o.p };
}

/**
 * The waves of a flat plate at α in a stream at M (shock-expansion theory): above, a fan at the
 * leading edge and a shock at the trailing edge; below, a shock then a fan (mirror the angles).
 * `upper` and `lower` are the Mach numbers along each surface.
 */
export function plateWaves(M: number, alpha: number, g: number) {
  const leFan = expansionFan(M, 0, alpha, g);
  const leShock = obliqueLine(M, 0, alpha, g);
  if (!leFan || !leShock) return undefined;
  const upper = leFan[leFan.length - 1]!.M;
  const lower = leShock.M2;
  // Above at the trailing edge: flow along −α turns up by α. Below: mirrored, it turns away.
  const teShock = obliqueLine(upper, -alpha, alpha, g);
  const teFan = expansionFan(lower, alpha, alpha, g);
  if (!teShock || !teFan) return undefined;
  return { leFan, leShock, teShock, teFan, upper, lower };
}

/** The Mach cone's half-angle (radians) of a point moving at M; none below M = 1. */
export const machCone = (M: number) => (M > 1 ? Math.asin(1 / M) : undefined);
