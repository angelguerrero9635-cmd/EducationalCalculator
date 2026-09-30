/**
 * Ball-and-stick layouts for molecules the Grade 10 polarity and attraction cards name (H101
 * part 9: BF₃, CCl₄, CHCl₃, CH₂O), which `chem.ts` looks up after its own. Bond length 1, y down,
 * z > 0 nearer. No page drew these formulas before, so no picture changes.
 */
import type { Atom, Molecule } from './chem';

const A = (el: string, x: number, y: number, z = 0): Atom => ({ el, x, y, z });

/** Four atoms around a center, a tetrahedron seen a little from the side (as CH₄ in chem.ts). */
const tetrahedral = (center: string, outer: [string, string, string, string]): Molecule => ({
  atoms: [
    A(center, 0, 0),
    A(outer[0], 0, -1),
    A(outer[1], -0.94, 0.4),
    A(outer[2], 0.94, 0.4),
    A(outer[3], 0.3, 0.55, -1),
  ],
  bonds: [
    [0, 1, 1],
    [0, 2, 1],
    [0, 3, 1],
    [0, 4, 1],
  ],
});

export const EXTRA_LAYOUTS: Record<string, Molecule> = {
  // Trigonal planar, 120° apart.
  BF3: {
    atoms: [A('B', 0, 0), A('F', 0, -1), A('F', -0.87, 0.5), A('F', 0.87, 0.5)],
    bonds: [
      [0, 1, 1],
      [0, 2, 1],
      [0, 3, 1],
    ],
  },
  CCl4: tetrahedral('C', ['Cl', 'Cl', 'Cl', 'Cl']),
  // The H on top: the three Cl pull one way, so the molecule is polar.
  CHCl3: tetrahedral('C', ['H', 'Cl', 'Cl', 'Cl']),
  // Formaldehyde: trigonal planar, C=O up.
  CH2O: {
    atoms: [A('C', 0, 0.15), A('O', 0, -0.95), A('H', -0.9, 0.7), A('H', 0.9, 0.7)],
    bonds: [
      [0, 1, 2],
      [0, 2, 1],
      [0, 3, 1],
    ],
  },
};
