/**
 * Ball-and-stick layouts for the molecules inorganic#0's symmetry cards name (HC113): PCl₃,
 * PCl₅, SF₆, XeF₄, [PtCl₄]²⁻, [Fe(CN)₆]⁴⁻, HCN, C₂H₂, CH₂Cl₂ and trans-N₂F₂, seen in the
 * symmetry pictures' view (`symmetryMath.ts`). `chem.ts` looks them up after its own, so no
 * formula drawn before changes.
 */
import type { Molecule } from './chem';
import { CARD_MOLECULES, SYMMETRY_MOLECULES, view, type Molecule3 } from './symmetryMath';

const flat = (m: Molecule3): Molecule => ({
  atoms: m.atoms.map((a) => {
    const p = view(a.p);
    return { el: a.el, x: p.x, y: p.y, z: p.z };
  }),
  bonds: m.bonds,
});

const NEW = ['PCl5', 'SF6', 'XeF4', 'CH2Cl2', 'N2F2'] as const;

export const HE4D_LAYOUTS: Record<string, Molecule> = {
  ...Object.fromEntries(NEW.map((k) => [k, flat(SYMMETRY_MOLECULES[k]!)])),
  ...Object.fromEntries(Object.entries(CARD_MOLECULES).map(([k, m]) => [k, flat(m)])),
};
