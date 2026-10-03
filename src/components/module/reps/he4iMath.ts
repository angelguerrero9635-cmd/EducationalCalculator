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

/** HC149: the Bessel function J₁(v), from its integral (1/π)∫₀^π cos(τ − v sin τ) dτ. */
export function besselJ1(v: number): number {
  const n = 96;
  let sum = 0;
  for (let k = 0; k <= n; k++) {
    const t = (Math.PI * k) / n;
    const w = k === 0 || k === n ? 1 : k % 2 ? 4 : 2;
    sum += w * Math.cos(t - v * Math.sin(t));
  }
  return sum / (3 * n);
}

/** HC149: an Airy disk's brightness at r, its first dark ring at radius d (peak 1). */
export function airy(r: number, d: number): number {
  const v = (3.8317 * Math.abs(r)) / d;
  if (v < 1e-6) return 1;
  const a = (2 * besselJ1(v)) / v;
  return a * a;
}

/** HC149: whether two points gap apart are resolved: separate, just (within 2%), or one blob. */
export const resolvedAs = (gap: number, d: number): 'resolved' | 'just' | 'blob' =>
  gap < d ? 'blob' : gap <= 1.02 * d ? 'just' : 'resolved';
