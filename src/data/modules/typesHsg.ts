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

// ─── H35 punnettSquare: high-school inheritance patterns ─────────────────────

/**
 * The `inheritance` option on a `punnettSquare` (Grade 9). Without it the square is the Grade 7
 * one. The parents' values stay counts of dominant alleles (`first`, `second`).
 *
 * - `dihybrid`: two genes, a 4 × 4 square of the parents' four gametes each; `firstB` and
 *   `secondB` count the second gene's dominant alleles (letter `letterB`). `dominant` holds the
 *   boxes showing both dominant traits (of 16), `recessive` (optional) the boxes showing neither.
 *   `names` names the four phenotypes (both dominant, first only, second only, neither).
 * - `incomplete`: the heterozygote is a blend (red × white gives pink); `codominant`: it shows
 *   both (red and white hairs: roan). `dominant` holds the boxes homozygous for the first allele,
 *   `recessive` (optional) the boxes homozygous for the second, `middle` (optional) the
 *   heterozygotes. `alleles` writes them as the letter with superscripts (C with ["R", "W"] is
 *   Cᴿ and Cᵂ); `names` names the three phenotypes (default red, pink or roan, white).
 * - `xLinked`: the gene is on the X chromosome. `first` is the mother (0–2 dominant alleles),
 *   `second` the father (0 or 1): the father's Xᴬ or Xᵃ and Y across the top, the mother's two X
 *   down the side. Daughters and sons are labelled; carrier daughters are half-shaded.
 *   `dominant` holds the boxes without the recessive trait, `recessive` (optional) the boxes with
 *   it, `carriers` (optional) the carrier daughters.
 */
export type PunnettInheritance =
  | {
      pattern: 'dihybrid';
      firstB: string;
      secondB: string;
      letterB: string;
      names?: [string, string, string, string];
    }
  | {
      pattern: 'incomplete' | 'codominant';
      middle?: string;
      alleles?: [string, string];
      names?: [string, string, string];
    }
  | { pattern: 'xLinked'; carriers?: string };

/** The variables an `inheritance` option reads (for modules.test.ts). */
export const inheritanceVars = (h: PunnettInheritance): string[] =>
  h.pattern === 'dihybrid'
    ? [h.firstB, h.secondB]
    : h.pattern === 'xLinked'
      ? h.carriers
        ? [h.carriers]
        : []
      : h.middle
        ? [h.middle]
        : [];

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

// ─── H36 dnaStrand (calculator picture) ──────────────────────────────────────

/**
 * A DNA ladder from a base sequence (up to 12 pairs, 13 with an insertion): the template strand
 * on top (written 3′ to 5′, the way it is read), its complement under it with two hydrogen bonds
 * for A–T and three for G–C, the mRNA transcribed from the template (U for T), its codons
 * bracketed and each codon's amino acid from the standard codon table (Stop ends the chain).
 *
 * - `sequence`: the template strand, A, T, G and C ("TACCGGTTCATT").
 * - `length`: bases drawn from the start (a number or a variable; default all).
 * - `show`: the rows past the ladder (default all: the mRNA and the protein).
 * - `mutation`: a substitution (to `base`; default the transition A↔G, C↔T), an insertion (of
 *   `base`, default A) or a deletion at base `at`
 *   (1 = the first, a number or a variable). The mutated strand is drawn with the change lit, and
 *   the protein before and after, the changed amino acids lit; the caption names the effect
 *   (silent, missense, nonsense or frameshift).
 * - `percentA`: Chargaff's rule instead of a sequence: `pairs` (default 10) base pairs with A
 *   (and so T) this percent of the bases, G and C the rest; a percent that isn't a whole number
 *   of bases draws faded.
 * - `codons`: a variable holding the complete codons drawn (checked).
 */
export interface DnaStrandSpec {
  kind: 'dnaStrand';
  sequence?: string;
  length?: NumOrVar;
  show?: ('mrna' | 'protein')[];
  mutation?: {
    type: 'substitution' | 'insertion' | 'deletion';
    at: NumOrVar;
    base?: 'A' | 'T' | 'G' | 'C';
  };
  percentA?: NumOrVar;
  pairs?: number;
  codons?: string;
}

/** Group HG's calculator pictures. */
export type HsgSpec = MembraneSpec | DnaStrandSpec;

/** Every variable id a group-HG picture reads (for modules.test.ts). */
export function hsgSpecVars(r: HsgSpec): string[] {
  const ids = (xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'membrane':
      return ids([r.outside, r.inside, r.moved, r.atp, r.gradient]);
    case 'dnaStrand':
      return ids([r.length, r.mutation?.at, r.percentA, r.codons]);
  }
}
