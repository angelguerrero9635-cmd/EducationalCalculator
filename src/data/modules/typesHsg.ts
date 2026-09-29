/**
 * Picture specs and scene fields for the Grades 9–12 biology pictures of group HG (H31–H36 in
 * `pictureRequestsHs.ts`), kept apart from `types.ts` and `layouts/types.ts` so those files only
 * name them.
 */

// ─── H31 macromolecules (explore) ────────────────────────────────────────────

/** The four kinds of biological molecule a `macromolecules` figure builds. */
export type MacroKind = 'carbohydrate' | 'protein' | 'nucleicAcid' | 'lipid';

/**
 * A `macromolecules` scene: monomers joining into a polymer by dehydration synthesis, one water
 * molecule given off per bond; `split` runs it backward (hydrolysis: water added, the polymer
 * broken into monomers).
 *
 * - `carbohydrate`: glucose rings into a starch chain (glycosidic bonds);
 * - `protein`: amino acids (each its own side chain R) into a chain (peptide bonds), and the
 *   chain folded into its shape;
 * - `nucleicAcid`: nucleotides (phosphate, sugar, base) into a strand (sugar–phosphate bonds);
 * - `lipid`: glycerol and three fatty acids into a fat (three ester bonds). Not a polymer:
 *   always three fatty acids, three water molecules.
 *
 * `count`: the monomers joined, 2 to 4 (default 3; a lipid ignores it).
 */
export interface MacroScene {
  kind: MacroKind;
  count?: number;
  split?: boolean;
}

/** Water molecules a `macromolecules` scene gives off (or takes in): one per new bond. */
export const watersOf = (m: MacroScene) =>
  m.kind === 'lipid' ? 3 : Math.min(4, Math.max(2, m.count ?? 3)) - 1;
