/**
 * The arithmetic a `velocityProfile` picture draws (HC13), shared with its harness check. Every
 * value is in SI (the spec's `si` factors turn a page's mm, mL/min or mPa·s into m, m³/s, Pa·s).
 */
import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { VelocityProfileSpec } from '@/data/modules/typesHe1f';

/** Reads a field of the spec in SI, or undefined while it is "?". */
export type SiGetter = (field: keyof VelocityProfileSpec) => number | undefined;

/** A field's SI value from a value reader (in the variable's unit) and the spec's factors. */
export function siGetter(
  spec: VelocityProfileSpec,
  get: (x: NumOrVar) => number | undefined,
): SiGetter {
  return (field) => {
    const x = spec[field];
    if (x === undefined || typeof x === 'boolean' || typeof x === 'object') return undefined;
    const v = get(x as NumOrVar);
    return v === undefined ? undefined : v * (spec.si?.[field] ?? 1);
  };
}

/** The radial positions the tube's arrows are drawn at, as fractions of R (wall to wall). */
export const TUBE_STATIONS = [-0.875, -0.625, -0.375, -0.125, 0, 0.125, 0.375, 0.625, 0.875];

/** Laminar tube flow: the speed at r ÷ R = s, v = v_max(1 − s²). */
export const tubeSpeed = (vmax: number, s: number) => vmax * (1 - s * s);

/** The tube's centre speed from its flow: v_max = 2v_avg = 2Q ÷ πR². */
export const tubeCentre = (Q: number, R: number) => (2 * Q) / (Math.PI * R * R);

/** A falling film's speed at a share η of its thickness from the wall: v_max(2η − η²). */
export const filmSpeed = (vmax: number, eta: number) => vmax * (2 * eta - eta * eta);

/** Couette flow: the speed a share η of the gap up from the still plate, η × V. */
export const plateSpeed = (V: number, eta: number) => V * eta;

/** Stefan tube: x_A at a share ζ of the way up, (1 − x) = (1 − x₁)((1 − x₂) ÷ (1 − x₁))^ζ. */
export const stefanFraction = (x1: number, x2: number, zeta: number) =>
  1 - (1 - x1) * ((1 - x2) / (1 - x1)) ** zeta;

/** Stefan tube flux: N_A = (cD ÷ L) ln((1 − x₂) ÷ (1 − x₁)). */
export const stefanFlux = (c: number, D: number, L: number, x1: number, x2: number) =>
  ((c * D) / L) * Math.log((1 - x2) / (1 - x1));

/** The thermal and concentration layers against the velocity layer: Pr^(−1/3), Sc^(−1/3). */
export const layerRatio = (n: number) => n ** (-1 / 3);
