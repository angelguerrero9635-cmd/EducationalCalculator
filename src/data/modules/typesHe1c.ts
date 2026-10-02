/**
 * College pictures, round 1, group C (docs/RENDERINGS_HE.md, HC2): the `skeletal` kind and the
 * `skeletal` card figure. Kept apart from `types.ts` so its union only names them. A
 * `NumOrVar` is a fixed number or a variable id. Structures are written in a small SMILES-like
 * spec read by `reps/skeletalMath.ts` (no dependency): `CC(=O)C`, `O=C1CCCCC1`, `c1ccncc1`,
 * `C[C@@H](O)CC`, `C/C=C/C`, `[cH-]1cccc1`. Atoms are numbered from 0 in written order.
 */
import type { GroupName } from '@/components/module/reps/skeletalMath';

import type { NumOrVar } from './typesGraphs';

export type { GroupName } from '@/components/module/reps/skeletalMath';

/** A functional group to light: by name (every match), or the atoms by number. */
export type SkeletalLit = GroupName | number[];

/** One structure a formula can draw: its spec and its name. */
export interface SkeletalCandidate {
  smiles: string;
  name: string;
}

/**
 * `skeletal` (HC2): a line-angle structure. Carbons are the corners and ends of the lines, with
 * their H left out; heteroatoms are written with their H (OH, NH₂, HO); double bonds are two
 * lines (the second inside a ring), triple bonds three; a stereocenter's bond is a wedge
 * (toward you) or a dash (away), from its `@`/`@@`; charges are written by the atom.
 *
 * - `smiles`: the structure (or `candidates` with `ihd`, below).
 * - `group`: a functional group lit (a tinted band under its bonds and atoms, named in the
 *   caption).
 * - `numbered`: the parent chain numbered (true: the longest chain with the principal group and
 *   the lowest numbers; or the atoms in order, C1 first).
 * - `center`: an atom whose four groups get their CIP ranks 1–4 (its H drawn), and R or S
 *   beside it (`rs: false` leaves R or S for the student).
 * - `ihd`: the formula's counts as values. The picture draws the first of `candidates` whose
 *   C, H, N and X fit them (and whose π bonds and rings fit `pi` and `rings` when given), each
 *   ring marked "ring" and each π bond "π" (a triple bond "2π"), with the tally rings + π bonds
 *   = IHD. `hydrogen: true` marks each π bond "+H₂" instead (hydrogenation adds one H₂ per π
 *   bond; rings stay). A formula no candidate fits draws only the tally.
 * - `enantiomers`: the structure and its mirror image side by side (every wedge turned to a
 *   dash), with `major` (%) under the one drawn and 100 − major under its mirror.
 * - `mode: 'chair'`: cyclohexane's chair before and after a ring flip, `groups` on carbons 1–6
 *   (up or down; a group axial in one chair is equatorial in the other), the 1,3-diaxial H
 *   dotted beside an axial group, the equilibrium arrows with `k` (after ÷ before; the longer
 *   arrow toward the favored chair) and `percent` (the flipped chair's share) as a bar under
 *   each chair. `energy` and `temperature` are written on the arrows.
 */
export interface SkeletalSpec {
  kind: 'skeletal';
  mode?: 'structure' | 'chair';
  smiles?: string;
  /** The structure's name, for the caption ("cyclohexanone"). */
  name?: string;
  group?: SkeletalLit;
  numbered?: boolean | number[];
  center?: number;
  rs?: boolean;
  ihd?: {
    carbons: NumOrVar;
    hydrogens: NumOrVar;
    nitrogens?: NumOrVar;
    halogens?: NumOrVar;
    value?: NumOrVar;
    pi?: NumOrVar;
    rings?: NumOrVar;
    hydrogen?: boolean;
  };
  candidates?: SkeletalCandidate[];
  enantiomers?: { major: NumOrVar };
  chair?: {
    groups: { at: number; label: string; face: 'up' | 'down' }[];
    energy?: NumOrVar;
    temperature?: NumOrVar;
    k?: NumOrVar;
    percent?: NumOrVar;
  };
}

/** Every variable id a `skeletal` picture reads (for modules.test.ts). */
export function skeletalVars(r: SkeletalSpec): string[] {
  const ids = (...xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  const i = r.ihd;
  const c = r.chair;
  return [
    ...(i ? ids(i.carbons, i.hydrogens, i.nitrogens, i.halogens, i.value, i.pi, i.rings) : []),
    ...ids(r.enantiomers?.major),
    ...(c ? ids(c.energy, c.temperature, c.k, c.percent) : []),
  ];
}

/**
 * The `skeletal` card figure (HC2): one structure on a sort card or a sequence stage, 112 × 76,
 * in the text color; `group` lit in the card's shade; `numbered`, `center` (CIP ranks) and `rs`
 * (R or S beside the center) as on the picture. `ranks: false` leaves the ranks off a center.
 */
export interface SkeletalCard {
  kind: 'skeletal';
  smiles: string;
  group?: SkeletalLit;
  numbered?: boolean | number[];
  center?: number;
  ranks?: boolean;
  rs?: boolean;
}

export const SKELETAL_CARD_W = 112;
export const SKELETAL_CARD_H = 76;
