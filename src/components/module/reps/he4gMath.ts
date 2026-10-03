/**
 * The relations group HE4G's college pictures draw (typesHe4g.ts), shared with their harness
 * checks so the picture and the check agree. Every constant is a parameter: the page passes it,
 * and the defaults here are the plan's (docs/plans/he.earth-geography.md, "Constants").
 */

/** g (m/s²), R_d (J/(kg·K)) and κ = R_d ÷ c_p, the earth pages' values. */
export const G_EARTH = 9.81;
export const R_DRY = 287;
export const KAPPA = 0.286;

// ── HC122: the hypsometric equation ──

/** The scale height H = R_d T̄ ÷ g, m. */
export const scaleHeightOf = (t: number, g = G_EARTH, rd = R_DRY) => (rd * t) / g;

/** The thickness Δz = H ln(p₁ ÷ p₂), in H's unit. */
export const thicknessOf = (h: number, p1: number, p2: number) => h * Math.log(p1 / p2);

/** The pressure z above p₁: p = p₁e^(−z/H) (z and H in one unit). */
export const pressureAt = (p1: number, z: number, h: number) => p1 * Math.exp(-z / h);

// ── HC123: potential temperature and humidity ──

/** θ = T(1,000 ÷ p)^κ (T in K, p in hPa). */
export const thetaOf = (t: number, p: number, kappa = KAPPA) => t * (1000 / p) ** kappa;

/** The temperature on the dry adiabat θ at p: T = θ(p ÷ 1,000)^κ. */
export const adiabatAt = (theta: number, p: number, kappa = KAPPA) => theta * (p / 1000) ** kappa;

/** Tetens' coefficients a (hPa), b, c (°C), the earth pages' values. */
export const TETENS: [number, number, number] = [6.112, 17.67, 243.5];

/** The saturation vapor pressure e_s (hPa) at T (°C): a e^(bT ÷ (T + c)). */
export const tetensOf = (t: number, [a, b, cc]: [number, number, number] = TETENS) =>
  a * Math.exp((b * t) / (t + cc));

/** The dew point (°C) where e_s = e: the inverse of Tetens. */
export function dewPointOf(e: number, [a, b, cc]: [number, number, number] = TETENS) {
  const l = Math.log(e / a);
  return (cc * l) / (b - l);
}

/** The mixing ratio r = 622e ÷ (p − e), g/kg. */
export const mixingOf = (e: number, p: number) => (622 * e) / (p - e);

/** Pressure ticks for a log axis from `lo` to `hi` hPa: 1, 2, 5 × 10ⁿ (and 3, 7 when few). */
export function logTicks(lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let e = Math.floor(Math.log10(lo)) - 1; e <= Math.ceil(Math.log10(hi)); e++)
    for (const m of [1, 2, 3, 5, 7]) {
      const p = m * 10 ** e;
      if (p >= lo * 0.999 && p <= hi * 1.001) out.push(Number(p.toPrecision(6)));
    }
  return out;
}

/** A tick step of 1, 2 or 5 × 10ⁿ giving at most `most` steps over `span`. */
export function tickStep(span: number, most: number): number {
  const raw = span / most;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

// ── HC124: a parcel's cloud base with the page's lapse rates ──

/** The cloud base (km) where the parcel (dry °C/km) meets its dew point (dew °C/km). */
export const lclOf = (t: number, td: number, dry: number, dew: number) => (t - td) / (dry - dew);

// ── HC125: the one-layer greenhouse ──

/**
 * The bands of a one-layer greenhouse absorbing F (W/m²) at the ground, with a layer of
 * emissivity ε: the ground's σT_s⁴ = 2F ÷ (2 − ε), the share εG the layer absorbs, the share
 * (1 − ε)G that escapes, and the layer's εG ÷ 2 each way.
 */
export function layerBudget(f: number, eps: number) {
  const ground = (2 * f) / (2 - eps);
  return {
    ground,
    absorbed: eps * ground,
    through: (1 - eps) * ground,
    half: (eps * ground) / 2,
    /** T_s from Tₑ: Tₑ(2 ÷ (2 − ε))^(1/4). */
    surfaceTemp: (te: number) => te * (2 / (2 - eps)) ** 0.25,
  };
}

// ── HC130: Snell's law with speeds ──

/** sin r = (v₂ ÷ v₁) sin i; the critical angle sin⁻¹(v₁ ÷ v₂) into a faster layer. */
export function snellSpeeds(v1: number, v2: number, deg: number) {
  const s = (v2 / v1) * Math.sin((deg * Math.PI) / 180);
  // At the critical angle itself (to rounding) the ray runs along the boundary, r = 90°.
  const total = Math.abs(s) > 1 + 1e-4;
  return {
    refracted: total ? undefined : (Math.asin(Math.max(-1, Math.min(1, s))) * 180) / Math.PI,
    critical: v2 > v1 ? (Math.asin(v1 / v2) * 180) / Math.PI : undefined,
    total,
  };
}

// ── HC131: gravity over a buried sphere; Airy isostasy ──

/** G, N·m²/kg², the plan's value. */
export const G_NEWTON = 6.674e-11;

/** The sphere's excess mass (4 ÷ 3)πR³Δρ, kg. */
export const sphereMassOf = (r: number, drho: number) => (4 / 3) * Math.PI * r ** 3 * drho;

/** The peak anomaly G × mass ÷ z², in mGal (1 mGal = 10⁻⁵ m/s²). */
export const spherePeakOf = (mass: number, z: number, g = G_NEWTON) => ((g * mass) / z ** 2) * 1e5;

/** The anomaly x from the point over the centre: Δg_max(1 + x² ÷ z²)^(−3/2). */
export const sphereAnomalyAt = (peak: number, x: number, z: number) =>
  peak * (1 + (x * x) / (z * z)) ** -1.5;

/** Where the anomaly is half its peak: z√(2^(2/3) − 1) = 0.766z. */
export const HALF_WIDTH = Math.sqrt(2 ** (2 / 3) - 1);

/** Airy's root r = hρ_c ÷ (ρ_m − ρ_c). */
export const airyRootOf = (h: number, rc: number, rm: number) => (h * rc) / (rm - rc);

// ── HC132: a Wenner array ──

/** ρ_a = 2πaV ÷ I. */
export const wennerOf = (a: number, v: number, i: number) => (2 * Math.PI * a * v) / i;
