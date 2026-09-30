/**
 * The numbers behind the decay chart (H57), shared by the picture and its harness check: the
 * atoms of the grid, the order they decay in (random, from a fixed seed), how many are left
 * after a time, and the particles of nuclear equations.
 */
import { seeded } from './statMath';

/** Atoms in the grid. */
export const GRID_ATOMS = 100;

/** The share left after t with half-life T: (1/2)^(t ÷ T). */
export const shareLeft = (t: number, T: number) => (T > 0 ? 0.5 ** (Math.max(0, t) / T) : 1);

/** Atoms of the grid left undecayed after t: 100 × (1/2)^(t ÷ T), rounded. */
export const atomsLeft = (t: number, T: number) => Math.round(GRID_ATOMS * shareLeft(t, T));

/** The grid's atoms in the order they decay: a fixed shuffle, the same every time. */
export const DECAY_ORDER: number[] = (() => {
  const rand = seeded(57);
  const order = Array.from({ length: GRID_ATOMS }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return order;
})();

/** The particles of nuclear equations: symbol, mass number, atomic number and name. */
export const PARTICLES = {
  alpha: { symbol: 'He', mass: 4, atomic: 2, name: 'alpha particle' },
  beta: { symbol: 'e', mass: 0, atomic: -1, name: 'beta particle' },
  positron: { symbol: 'e', mass: 0, atomic: 1, name: 'positron' },
  neutron: { symbol: 'n', mass: 1, atomic: 0, name: 'neutron' },
  gamma: { symbol: 'γ', mass: 0, atomic: 0, name: 'gamma ray' },
} as const;
