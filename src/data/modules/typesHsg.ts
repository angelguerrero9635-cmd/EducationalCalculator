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

// ─── H33 organelleEnergy (explore) ───────────────────────────────────────────

/** What flows between the chloroplast, the mitochondrion and the cell. */
export type EnergySubstance = 'light' | 'CO₂' | 'H₂O' | 'glucose' | 'O₂' | 'ATP';

/** The processes an `organelleEnergy` scene can light: whole, or one stage. */
export type EnergyProcess =
  | 'cycle'
  | 'photosynthesis'
  | 'respiration'
  | 'lightReactions'
  | 'calvinCycle'
  | 'glycolysis'
  | 'krebsCycle'
  | 'electronTransport';

/**
 * An `organelleEnergy` scene: a chloroplast and a mitochondrion side by side, glucose and O₂
 * flowing from one to the other, CO₂ and H₂O flowing back, light in and ATP out to the cell's
 * work. `process` lights one process or stage (its part of the organelle and its flows; default
 * the whole cycle) and writes its equation; `lit` rings one substance (it must flow in that
 * process).
 */
export interface EnergyScene {
  process?: EnergyProcess;
  lit?: EnergySubstance;
}

/** The substances each process takes in or gives out (the arrows it lights). */
export const ENERGY_FLOWS: Record<EnergyProcess, EnergySubstance[]> = {
  cycle: ['light', 'CO₂', 'H₂O', 'glucose', 'O₂', 'ATP'],
  photosynthesis: ['light', 'CO₂', 'H₂O', 'glucose', 'O₂'],
  respiration: ['glucose', 'O₂', 'CO₂', 'H₂O', 'ATP'],
  lightReactions: ['light', 'H₂O', 'O₂'],
  calvinCycle: ['CO₂', 'glucose'],
  glycolysis: ['glucose', 'ATP'],
  krebsCycle: ['CO₂', 'ATP'],
  electronTransport: ['O₂', 'H₂O', 'ATP'],
};

// ─── H34 cellDivision (card figure for sequence stages) ──────────────────────

/** The stages a `cellDivision` card draws: the cell cycle and mitosis, then meiosis I and II. */
export type DivisionStage =
  | 'interphase'
  | 'prophase'
  | 'metaphase'
  | 'anaphase'
  | 'telophase'
  | 'cytokinesis'
  | 'prophase I'
  | 'metaphase I'
  | 'anaphase I'
  | 'telophase I'
  | 'prophase II'
  | 'metaphase II'
  | 'anaphase II'
  | 'telophase II';

/**
 * A card figure for one stage of cell division (a sequence stage or a sort card): the cell,
 * its chromosomes counted from `diploid` (2n: 2, 4 or 6; default 4), each homologous pair one
 * maternal (red) and one paternal (blue) chromosome, the spindle from the poles. Meiosis I pairs
 * the homologs and crosses them over (a swapped tip); telophase II ends in four cells of n.
 */
export interface CellDivisionCard {
  kind: 'cellDivision';
  stage: DivisionStage;
  diploid?: number;
}

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
