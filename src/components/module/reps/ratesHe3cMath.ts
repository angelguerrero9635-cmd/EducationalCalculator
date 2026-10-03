/**
 * HC54 (college round 3, group C): the sums behind the related-rates and pumping pictures.
 * Pure, so the harness checks use them too.
 */
import { formatNumber } from '@/engine/format';

/** Four significant figures, so a worked line reads true (0.159, not 0.16). */
export const sig4 = (x: number) => formatNumber(Number(x.toPrecision(4)) || 0);

/** a² + b² = c² differentiated: a·a′ + b·b′ − c·c′ (0 when the rates agree). */
export const rateGap = (a: number, b: number, c: number, da: number, db: number, dc: number) =>
  a * da + b * db - c * dc;

/** A cone tank on its apex: the surface radius at depth h, r = R·h ÷ H (similar triangles). */
export const coneSurface = (R: number, H: number, h: number) => (R * h) / H;

/** The surface's rise, dh/dt = (dV/dt) ÷ (πr²). */
export const coneRise = (inflow: number, r: number) => inflow / (Math.PI * r * r);

/** A slab at height y in a tank H tall lifts to `above` over the rim: H + above − y. */
export const slabLift = (H: number, above: number, y: number) => H + above - y;

/** Work to pump a full cylinder out over its rim plus `above`: ρgπr²(H²/2 + above·H). */
export const pumpWork = (rho: number, g: number, r: number, H: number, above: number) =>
  rho * g * Math.PI * r * r * ((H * H) / 2 + above * H);
