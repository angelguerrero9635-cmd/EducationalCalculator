/**
 * The sums behind the round-4 group C college pictures (typesHe4c.ts). The pictures and the
 * harness check share them, so what is drawn and what is checked can't drift apart.
 */

// ─── Axes ────────────────────────────────────────────────────────────────────

/** The smallest step of 1, 2, 2.5 or 5 × 10ⁿ giving at most `count` steps across `span`. */
export function niceStepOf(span: number, count: number) {
  if (!(span > 0)) return 1;
  const raw = span / Math.max(1, count);
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw * (1 - 1e-9))!;
}

/** Tick values every nice step across [lo, hi]. */
export function ticksOf(lo: number, hi: number, count = 4) {
  const step = niceStepOf(hi - lo, count);
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + step * 1e-6; v += step)
    out.push(Number(v.toPrecision(10)));
  return out;
}

// ─── HC99 polynomial motion ──────────────────────────────────────────────────

export type Cubic = readonly [number, number, number, number];

/** x, v = dx/dt and a = dv/dt at t for x = c₀ + c₁t + c₂t² + c₃t³. */
export function cubicAt([c0, c1, c2, c3]: Cubic, t: number) {
  return {
    x: c0 + c1 * t + c2 * t * t + c3 * t * t * t,
    v: c1 + 2 * c2 * t + 3 * c3 * t * t,
    a: 2 * c2 + 6 * c3 * t,
  };
}

/**
 * The turnarounds after t = 0: the times where v = c₁ + 2c₂t + 3c₃t² is 0 and changes sign (a
 * double root only touches 0, so the motion doesn't turn there), in order.
 */
export function turnarounds([, c1, c2, c3]: Cubic): number[] {
  const out: number[] = [];
  if (Math.abs(c3) < 1e-12) {
    if (Math.abs(c2) > 1e-12) out.push(-c1 / (2 * c2));
  } else {
    const disc = 4 * c2 * c2 - 12 * c3 * c1;
    if (disc > 1e-12 * Math.max(1, c2 * c2)) {
      const r = Math.sqrt(disc);
      out.push((-2 * c2 - r) / (6 * c3), (-2 * c2 + r) / (6 * c3));
    }
  }
  return out.filter((t) => t > 1e-9 && Number.isFinite(t)).sort((p, q) => p - q);
}

/**
 * The time window drawn, from 0: past t and the last turnaround by a fifth (a turnaround more
 * than four times t away is left out), at least 1.
 */
export function cubicSpan(c: Cubic, at: number | undefined) {
  const t = at !== undefined && at > 0 ? at : undefined;
  const near = turnarounds(c).filter((r) => t === undefined || r <= 4 * t);
  const last = Math.max(t ?? 0, ...near);
  return last > 0 ? last * 1.2 : 1;
}

// ─── HC101 force pulses ──────────────────────────────────────────────────────

export type PulseShape = 'rectangle' | 'triangle' | 'halfSine';

/** J ÷ (Fₘₐₓ·Δt) for each shape: 1, ½ and 2 ÷ π. */
export const PULSE_SHARE: Record<PulseShape, number> = {
  rectangle: 1,
  triangle: 0.5,
  halfSine: 2 / Math.PI,
};

/** The force at time t of a pulse of `peak` lasting `dt` (0 outside it). */
export function pulseForce(shape: PulseShape, peak: number, dt: number, t: number) {
  if (t < 0 || t > dt || dt <= 0) return 0;
  if (shape === 'rectangle') return peak;
  if (shape === 'triangle') return peak * (1 - Math.abs(2 * t - dt) / dt);
  return peak * Math.sin((Math.PI * t) / dt);
}

// ─── HC103 a rod as a physical pendulum ──────────────────────────────────────

/**
 * A uniform rod of length L and mass m on a pin p below its top end: d = L ÷ 2 − p, I about the
 * pin by parallel axes (or `inertia`), the period T = 2π√(I ÷ (mgd)) and the equivalent simple
 * length I ÷ (md). T and the length are undefined when d ≤ 0 (no restoring torque).
 */
export function rodPendulum(L: number, p: number, m: number, g: number, inertia?: number) {
  const d = L / 2 - p;
  const I = inertia ?? m * ((L * L) / 12 + d * d);
  const swings = d > 0 && m > 0 && g > 0 && I > 0;
  return {
    d,
    I,
    T: swings ? 2 * Math.PI * Math.sqrt(I / (m * g * d)) : undefined,
    Leq: swings ? I / (m * d) : undefined,
  };
}

// ─── HC104 spacetime ─────────────────────────────────────────────────────────

/** γ and an event's coordinates in S′ (moving at β): x′ = γ(x − βct), ct′ = γ(ct − βx). */
export function lorentzOf(beta: number, x: number, ct: number) {
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  return {
    gamma,
    xp: gamma * (x - beta * ct),
    ctp: gamma * (ct - beta * x),
    s2: ct * ct - x * x,
  };
}

/** Where a point with S′ coordinates (x′, ct′) sits in S: x = γ(x′ + βct′), ct = γ(ct′ + βx′). */
export function fromPrimed(beta: number, xp: number, ctp: number) {
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  return { x: gamma * (xp + beta * ctp), ct: gamma * (ctp + beta * xp) };
}

/** Relativistic velocity addition in units of c: u = (v + u′) ÷ (1 + vu′). */
export const addVelocities = (v: number, up: number) => (v + up) / (1 + v * up);

// ─── HC105 Compton scattering ────────────────────────────────────────────────

/** h ÷ (mₑc) in pm and hc in keV·pm (the plan's values; a page may pass its own). */
export const COMPTON_PM = 2.426;
export const HC_KEV_PM = 1240;

/**
 * A photon of λ (pm) scattered through θ (°) by a free electron at rest: Δλ, λ′, the energies
 * (keV), the electron's K and its recoil angle φ (° below the axis), and the momenta in units of
 * h per pm (p = 1 ÷ λ) with the electron's from p = p′ + pₑ.
 */
export function comptonOf(lam: number, thetaDeg: number, C = COMPTON_PM, hc = HC_KEV_PM) {
  const th = (thetaDeg * Math.PI) / 180;
  const shift = C * (1 - Math.cos(th));
  const lamP = lam + shift;
  const [p, pp] = [1 / lam, 1 / lamP];
  const pe = { x: p - pp * Math.cos(th), y: -pp * Math.sin(th) };
  return {
    shift,
    lamP,
    E: hc / lam,
    Ep: hc / lamP,
    K: hc / lam - hc / lamP,
    p,
    pp,
    pe,
    phi: Math.abs(pe.y) < 1e-12 * p ? 0 : (Math.atan2(-pe.y, pe.x) * 180) / Math.PI,
  };
}
