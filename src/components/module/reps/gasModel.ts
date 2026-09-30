/**
 * The numbers behind the gas piston (H51), shared by the picture and its harness check: how many
 * moles one drawn particle stands for, where the particles sit, how long their speed trails are
 * and whether a law holds between two states.
 */
import { seeded } from './statMath';

/** Particles a two-state page draws in each cylinder (the amount of gas never changes). */
export const HELD_PARTICLES = 20;
/** The most particles a cylinder draws. */
export const MAX_PARTICLES = 40;
/** The gas constant in L·atm/(mol·K), the default for PV = nRT. */
export const R_LATM = 0.0821;

/**
 * Moles per particle for n moles: the smallest 1, 2 or 5 × 10ᵏ that keeps the count at most
 * MAX_PARTICLES, preferring one that divides n exactly (so the count is exact).
 */
export function molesPerParticle(n: number): number {
  if (!(n > 0)) return 1;
  const options: number[] = [];
  for (let k = -3; k <= 3; k++) for (const m of [1, 2, 5]) options.push(m * 10 ** k);
  const fits = options.filter((p) => n / p <= MAX_PARTICLES + 1e-9);
  const exact = fits.find((p) => Math.abs(n / p - Math.round(n / p)) < 1e-9);
  return exact ?? fits[0] ?? 1000;
}

/** Particles drawn for n moles (at least one for any gas). */
export const particleCount = (n: number) =>
  n > 0 ? Math.max(1, Math.round(n / molesPerParticle(n))) : 0;

/**
 * `count` spots in the unit square, spread out: a jittered grid with its cells taken in a
 * seeded order, each with a direction of travel (radians). The same count gives the same spots.
 */
export function gasSpots(count: number, seed = 51): { x: number; y: number; dir: number }[] {
  const cols = Math.max(1, Math.ceil(Math.sqrt(count * 0.8)));
  const rows = Math.max(1, Math.ceil(count / cols));
  const rand = seeded(seed + count);
  const cells = Array.from({ length: cols * rows }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j]!, cells[i]!];
  }
  return cells.slice(0, count).map((cell) => {
    const [cx, cy] = [cell % cols, Math.floor(cell / cols)];
    return {
      x: (cx + 0.2 + 0.6 * rand()) / cols,
      y: (cy + 0.2 + 0.6 * rand()) / rows,
      dir: rand() * 2 * Math.PI,
    };
  });
}

/** A speed trail's length in pixels: the average speed grows as √T (600 K draws `at600`). */
export const trailLength = (kelvins: number, at600 = 13) =>
  Math.max(0, at600 * Math.sqrt(Math.max(0, kelvins) / 600));

/** The combined gas law's two sides, P × V ÷ T, for a state (held values count as 1). */
export const pvOverT = (p = 1, v = 1, t = 1) => (p * v) / t;
