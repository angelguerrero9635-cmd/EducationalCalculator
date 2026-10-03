/**
 * The math of the `refraction` picture (HC76, EG-P20): two-layer seismic refraction, a
 * reflection hyperbola and ground-penetrating radar. The picture, the harness and the gallery
 * demos use these, so what is drawn and what is checked are the same numbers. Speeds in m/s
 * (m/ns for radar), lengths in m, angles in degrees, times in s (ns for radar).
 */

const RAD = Math.PI / 180;

/** sin i_c = v₁ ÷ v₂ (degrees); NaN when the lower layer is not faster. */
export const criticalAngle = (v1: number, v2: number) =>
  v2 > v1 && v1 > 0 ? Math.asin(v1 / v2) / RAD : NaN;

/** h = (x_c ÷ 2)√((v₂ − v₁) ÷ (v₂ + v₁)). */
export const depthFromCrossover = (xc: number, v1: number, v2: number) =>
  (xc / 2) * Math.sqrt((v2 - v1) / (v2 + v1));

/** x_c = 2h√((v₂ + v₁) ÷ (v₂ − v₁)): where the head wave overtakes the direct wave. */
export const crossoverOf = (h: number, v1: number, v2: number) =>
  2 * h * Math.sqrt((v2 + v1) / (v2 - v1));

/** tᵢ = 2h cos i_c ÷ v₁ (s). */
export const interceptTime = (h: number, v1: number, v2: number) =>
  (2 * h * Math.cos(criticalAngle(v1, v2) * RAD)) / v1;

/** The nearest offset the head wave reaches the surface: 2h tan i_c. */
export const criticalDistance = (h: number, v1: number, v2: number) =>
  2 * h * Math.tan(criticalAngle(v1, v2) * RAD);

/** The direct wave's time at x. */
export const directTime = (x: number, v1: number) => x / v1;

/** The head wave's time at x (from the critical distance on): tᵢ + x ÷ v₂. */
export const headTime = (x: number, h: number, v1: number, v2: number) =>
  interceptTime(h, v1, v2) + x / v2;

/** A flat reflector at depth h: t(x) = √(x² + 4h²) ÷ v. */
export const reflectionTime = (x: number, h: number, v: number) => Math.sqrt(x * x + 4 * h * h) / v;

/** Radar speed v = c ÷ √εᵣ (c in m/ns, default 0.3). */
export const radarSpeed = (eps: number, c = LIGHT_M_PER_NS) => c / Math.sqrt(eps);

/** Radar depth d = vt ÷ 2 (t the two-way time). */
export const radarDepth = (v: number, t: number) => (v * t) / 2;

/** Light's speed in air, m/ns (the plan's 0.3). */
export const LIGHT_M_PER_NS = 0.3;

export { RAD };
