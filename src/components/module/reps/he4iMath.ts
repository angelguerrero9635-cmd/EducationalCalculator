/**
 * Sums for the college round-4 group I pictures (docs/RENDERINGS_HE.md), shared with their
 * harness checks (harness/picturesHe4i.ts).
 */
import { formatNumber } from '@/engine/format';

/** A number at 3 significant figures, as the pictures write a worked-out value. */
export const sig3 = (x: number) => formatNumber(Number(x.toPrecision(3)));

/** HC141: a sphere's surface area, volume and their ratio (3 ÷ r). */
export const cellRatio = (r: number) => ({
  area: 4 * Math.PI * r * r,
  volume: (4 / 3) * Math.PI * r ** 3,
  ratio: 3 / r,
});
