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

/** HC145: where the crossovers go (cM): between the first two loci, or either side of the middle. */
export const crossoverSpots = (pos: number[], doubles: boolean) =>
  doubles && pos.length >= 3
    ? [(pos[0]! + pos[1]!) / 2, (pos[1]! + pos[2]!) / 2]
    : pos.length >= 2
      ? [(pos[0]! + pos[1]!) / 2]
      : [];

/** HC145: the cM ruler's step: at most 8 steps along the map. */
export const mapStep = (total: number) =>
  [1, 2, 5, 10, 20, 25, 50, 100].find((s) => total / s <= 8) ?? 100;
