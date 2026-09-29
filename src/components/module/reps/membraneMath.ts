/**
 * The membrane picture's rules (H32, group HG), shared with the harness: how many particles a
 * side draws, which way the arrow points, and where each particle sits (a fixed shuffle, so the
 * same count always draws the same scatter).
 */
import type { MembraneSpec } from '@/data/modules/typesHsg';

/** Particles a side can draw, and particles shown crossing. */
export const MEMBRANE_MAX = 40;
export const MOVED_MAX = 12;

/** Which way things cross: into the cell, out of it, or both ways equally. */
export type Flow = 'in' | 'out' | 'both';

/**
 * Diffusion (simple or through a channel) runs from more to fewer; water in osmosis runs toward
 * the side with more solute (so away from the side with fewer); a pump moves particles from the
 * side with fewer to the side with more.
 */
export function flowOf(
  transport: MembraneSpec['transport'],
  outside: number,
  inside: number,
): Flow {
  if (outside === inside) return 'both';
  const more = outside > inside ? 'out' : 'in';
  if (transport === 'diffusion' || transport === 'facilitated')
    return more === 'out' ? 'in' : 'out';
  // Osmosis: water goes to the side with more solute; a pump fills the side with more.
  return more === 'out' ? 'out' : 'in';
}

/** A fixed order of the grid cells (a seeded shuffle), so particles keep their places. */
export function shuffled(n: number, seed: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  let s = seed;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return order;
}

/** A small fixed jitter for particle k (−1 to 1 on each axis). */
export const jitter = (k: number, seed: number): [number, number] => {
  const a = Math.sin(k * 12.9898 + seed * 78.233) * 43758.5453;
  const b = Math.sin(k * 39.3468 + seed * 11.135) * 24634.6345;
  return [2 * (a - Math.floor(a)) - 1, 2 * (b - Math.floor(b)) - 1];
};
