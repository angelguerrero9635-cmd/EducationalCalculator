/**
 * The arithmetic a `stressStrain` picture draws (HC28), shared with its harness check: units to
 * MPa, mm and N, the engineering curve by material model, the true curve, areas, a tube's I and
 * two members' shares. Nothing here is traced from a chart: the curve is built from the page's
 * E, σ_Y, UTS and ε_f.
 */

/** Factors to the drawing's units: stresses and moduli to MPa, lengths to mm, forces to N. */
const TO_BASE: Record<string, number> = {
  Pa: 1e-6,
  kPa: 1e-3,
  MPa: 1,
  GPa: 1e3,
  psi: 0.00689476,
  ksi: 6.89476,
  Msi: 6894.76,
  'J/m³': 1e-6,
  'kJ/m³': 1e-3,
  'MJ/m³': 1,
  m: 1000,
  cm: 10,
  mm: 1,
  μm: 1e-3,
  in: 25.4,
  N: 1,
  kN: 1e3,
  MN: 1e6,
  lbf: 4.44822,
  kip: 4448.22,
  'N·mm': 1,
  'N·m': 1e3,
  'kN·m': 1e6,
  'mm²': 1,
  'cm²': 100,
  'm²': 1e6,
  'in²': 645.16,
  'mm⁴': 1,
  'cm⁴': 1e4,
  'm⁴': 1e12,
  'in⁴': 416231.4,
  '%': 0.01,
  μ: 1e-6,
  με: 1e-6,
};

/** How many drawing units one of `unit` is (1 for a unit not listed, or none). */
export const toBase = (unit: string | undefined) => (unit ? (TO_BASE[unit] ?? 1) : 1);

/** The 0.2% offset that defines a metal's yield strength. */
export const OFFSET = 0.002;

export type Pt = [strain: number, stress: number];

export interface CurveInput {
  model: 'metal' | 'epp' | 'tissue' | 'linear';
  /** Modulus (MPa). */
  E: number;
  sy?: number;
  su?: number;
  /** Strain at the UTS, fracture strain and fracture stress. */
  eu?: number;
  ef?: number;
  sf?: number;
  toe?: number;
  /** How far a linear or tissue curve runs when nothing ends it. */
  reach?: number;
}

export interface Curve {
  /** The engineering curve, strain then stress. */
  pts: Pt[];
  /** The 0.2% offset yield point (metal), or where the flat part starts (epp). */
  yieldAt?: Pt;
  utsAt?: Pt;
  fracAt?: Pt;
  /** Strain added to a page's ε to place it on the curve (half the toe for tissue). */
  shift: number;
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/**
 * The engineering curve. A metal's knee is the Ramberg–Osgood shape ε = σ/E + 0.002(σ/σ_Y)ⁿ, so
 * the 0.2% offset line meets it at σ_Y exactly; it hardens as σ_Y + (UTS − σ_Y)(1 − (1 − t)^2.5),
 * flat at the UTS, and necks as UTS − (UTS − σ_f)t^2.5 to fracture. n is set so the knee runs
 * into the hardening at the same slope.
 */
export function engineeringCurve(c: CurveInput): Curve {
  const { E } = c;
  if (c.model === 'tissue') {
    const t = c.toe ?? 0.02;
    const toePts: Pt[] = Array.from({ length: 13 }, (_, k) => {
      const e = (t * k) / 12;
      return [e, (E * e * e) / (2 * t)];
    });
    const end = c.su !== undefined ? c.su / E + t / 2 : Math.max(c.reach ?? 0, 3 * t);
    const pts: Pt[] = [...toePts, [end, E * (end - t / 2)]];
    return {
      pts,
      shift: t / 2,
      ...(c.su !== undefined ? { utsAt: [end, c.su] as Pt, fracAt: [end, c.su] as Pt } : {}),
    };
  }
  if (c.model === 'linear' || c.sy === undefined) {
    const end = c.reach ?? 0.001;
    return { pts: [[0, 0], [end, E * end]], shift: 0 };
  }
  const sy = c.sy;
  if (c.model === 'epp') {
    const ey = sy / E;
    const end = Math.max(c.ef ?? 4 * ey, 1.5 * ey, c.reach ?? 0);
    return {
      pts: [[0, 0], [ey, sy], [end, sy]],
      yieldAt: [ey, sy],
      shift: 0,
      ...(c.ef !== undefined ? { fracAt: [end, sy] as Pt } : {}),
    };
  }
  // Metal.
  const ey2 = sy / E + OFFSET;
  const su = c.su !== undefined && c.su > sy ? c.su : undefined;
  const ef = c.ef !== undefined && c.ef > ey2 ? c.ef : undefined;
  let eu = c.eu ?? (ef !== undefined ? 0.55 * ef : undefined);
  if (eu !== undefined && ef !== undefined && (eu <= ey2 || eu >= ef)) {
    eu = ey2 + 0.55 * (ef - ey2);
  }
  if (eu !== undefined && eu <= ey2) eu = undefined;
  const P = 2.5;
  const slope = su !== undefined && eu !== undefined ? (P * (su - sy)) / (eu - ey2) : 0.02 * E;
  const n = clamp((1 / slope - 1 / E) * (sy / OFFSET), 4, 80);
  const pts: Pt[] = [];
  for (let k = 0; k <= 40; k++) {
    const s = (sy * k) / 40;
    pts.push([s / E + OFFSET * (s / sy) ** n, s]);
  }
  const out: Curve = { pts, yieldAt: [ey2, sy], shift: 0 };
  if (su === undefined || eu === undefined) return out;
  for (let k = 1; k <= 30; k++) {
    const t = k / 30;
    pts.push([ey2 + t * (eu - ey2), sy + (su - sy) * (1 - (1 - t) ** P)]);
  }
  out.utsAt = [eu, su];
  if (ef === undefined) return out;
  const sf = c.sf !== undefined && c.sf <= su ? c.sf : 0.85 * su;
  for (let k = 1; k <= 24; k++) {
    const t = k / 24;
    pts.push([eu + t * (ef - eu), su - (su - sf) * t ** 2.5]);
  }
  out.fracAt = [ef, sf];
  return out;
}

/** The true curve up to the UTS: σ_T = σ(1 + ε), ε_T = ln(1 + ε). */
export function trueCurve(c: Curve): Pt[] {
  const end = c.utsAt?.[0] ?? Infinity;
  return c.pts.filter(([e]) => e <= end + 1e-12).map(([e, s]) => [Math.log(1 + e), s * (1 + e)]);
}

/** The area under a strain–stress polyline (MJ/m³ when stress is in MPa). */
export function areaUnder(pts: Pt[]): number {
  let a = 0;
  for (let k = 1; k < pts.length; k++) {
    a += ((pts[k]![0] - pts[k - 1]![0]) * (pts[k]![1] + pts[k - 1]![1])) / 2;
  }
  return a;
}

/** The stress on a curve at a strain (linear between its points). */
export function stressAt(pts: Pt[], e: number): number {
  if (e <= pts[0]![0]) return pts[0]![1];
  for (let k = 1; k < pts.length; k++) {
    const [e1, s1] = pts[k]!;
    const [e0, s0] = pts[k - 1]!;
    if (e <= e1) return e1 === e0 ? s1 : s0 + ((s1 - s0) * (e - e0)) / (e1 - e0);
  }
  return pts[pts.length - 1]![1];
}

/** Resilience, σ_Y² ÷ 2E (MJ/m³ with MPa). */
export const resilience = (sy: number, E: number) => (sy * sy) / (2 * E);

/** A round tube's second moment about a diameter, π(r_o⁴ − r_i⁴) ÷ 4. */
export const tubeI = (ro: number, ri: number) => (Math.PI * (ro ** 4 - ri ** 4)) / 4;

/** Member 1's share of a load two bonded members carry: E₁A₁ ÷ (E₁A₁ + E₂A₂). */
export const shareOf = (E1: number, A1: number, E2: number, A2: number) =>
  (E1 * A1) / (E1 * A1 + E2 * A2);

/** The smallest factor (1, 2, 5, 10 …) that makes a stretch `px` at least `min` px. */
export function stretchFactor(px: number, min = 8): number {
  if (!(px > 0) || px >= min) return 1;
  for (let p = 1; p <= 1e7; p *= 10) {
    for (const m of [1, 2, 5]) if (px * m * p >= min) return m * p;
  }
  return 1e7;
}

/** Tick step for an axis 0 … max (max from niceCeil): 4 or 5 ticks. */
export function tickStep(max: number): number {
  const pow = 10 ** Math.floor(Math.log10(max));
  const m = Math.round((max / pow) * 100) / 100;
  const f = m <= 1 ? 0.2 : m <= 2 ? 0.5 : m <= 2.5 ? 0.5 : m <= 5 ? 1 : 2;
  return f * pow;
}
