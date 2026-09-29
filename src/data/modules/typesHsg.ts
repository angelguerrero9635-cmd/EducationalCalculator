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

// ─── H32 membrane (calculator picture) ───────────────────────────────────────

/** A fixed number or a variable id (as in `typesGraphs.ts`). */
type NumOrVar = number | string;

/**
 * A patch of cell membrane, the outside above and the cytoplasm below: a phospholipid bilayer
 * (heads out, tails in) with the particles on each side counted exactly from the values (0–40).
 *
 * - `diffusion`: small particles (O₂, CO₂) cross the bilayer itself, from the side with more to
 *   the side with fewer; equal counts draw a two-way arrow (no net movement).
 * - `facilitated`: the same, through a channel protein (glucose, ions).
 * - `osmosis`: the particles are solute that can’t cross; water crosses through an aquaporin
 *   toward the side with more solute.
 * - `active`: a pump protein carries particles from the side with fewer to the side with more,
 *   against the gradient, using ATP (drawn as `atp` ATP → ADP + P at the pump).
 *
 * `moved`: particles crossing now (0–12), drawn lit on the arrow as they cross, on neither
 * side's count; never more than the side they leave has.
 * `gradient`: a variable holding outside − inside (checked). `particle` names them in the key
 * ("O₂", "glucose", "Na⁺"; default "particles").
 */
export interface MembraneSpec {
  kind: 'membrane';
  outside: NumOrVar;
  inside: NumOrVar;
  transport: 'diffusion' | 'facilitated' | 'osmosis' | 'active';
  particle?: string;
  moved?: NumOrVar;
  atp?: NumOrVar;
  gradient?: string;
}

/** Group HG's calculator pictures. */
export type HsgSpec = MembraneSpec;

/** Every variable id a group-HG picture reads (for modules.test.ts). */
export function hsgSpecVars(r: HsgSpec): string[] {
  const ids = (xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'membrane':
      return ids([r.outside, r.inside, r.moved, r.atp, r.gradient]);
  }
}
