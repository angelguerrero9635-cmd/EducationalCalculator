/**
 * College pictures, round 4, group I (docs/RENDERINGS_HE.md): biology. Kept apart from
 * `types.ts`, `typesHs2e.ts` and `layouts/types.ts` so each gains a line. A `NumOrVar` field is
 * a fixed number or a variable id, read in the variable's shown unit; a string field is the
 * page's own value, checked.
 *
 * - HC141 `curvedSolid` `ratio`: a cell as a sphere, A, V and A ÷ V, and a bigger cell beside it.
 * - HC142 `cellDivision` `content`: chromosomes, chromatids and DNA in c by stage.
 * - HC144 `pedigree`: a family in the standard symbols, as a calculator picture and a card.
 * - HC145 `linkageMap`: loci on a chromosome to scale in cM, homologs with their crossovers.
 * - HC146 card `codons`: a codon strip before and after a point mutation.
 * - HC147 `geneExpression` `corepressor`: the trp repressor binds only with tryptophan.
 * - HC149 `fieldOfView` `resolution`: two points blurred to Airy disks, resolved or not.
 */
import type { PedigreePerson } from './layouts/types';
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | false | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ─── HC141: curvedSolid ratio ───────────────────────────────────────────────────

/**
 * HC141 (B-P1): `ratio` on a `curvedSolid` sphere (a cell). The cell is drawn as a lit ball of
 * radius r with r marked; under it A = 4πr², V = (4/3)πr³ and A ÷ V = 3 ÷ r (`area`, `volume`
 * and `ratio` are the page's values, checked). `compare` (a factor, default 2; `false` for one
 * cell) draws a second cell of radius r × factor beside it at the same scale with its own A,
 * V and A ÷ V, so the ratio falls as the cell grows. A "?" r draws no cell; a "?" A, V or ratio
 * leaves its line out.
 */
export interface CurvedSolidHe4i {
  ratio?: {
    area?: string;
    volume?: string;
    ratio?: string;
    compare?: NumOrVar | false;
  };
}

/** The variable ids the HC141 option names (for the module tests). */
export function curvedSolidHe4iVars(r: CurvedSolidHe4i): string[] {
  const q = r.ratio;
  return ids(q?.area, q?.volume, q?.ratio, q?.compare);
}

// ─── HC142: cellDivision content ─────────────────────────────────────────────────

/**
 * HC142 (B-P3): `content` on the `cellDivision` calculator picture. Four cells in a row, G₁,
 * after S, after meiosis I and a gamete, each with its chromosomes (every one up to 2n = 6,
 * past that one pair and "× n"), and under them a table of each stage's chromosomes,
 * chromatids and DNA content in c (G₁ 2c, after S 4c, after meiosis I 2c, gamete 1c).
 * `chromatids` is the page's chromatids after S (2 × 2n), `dna` its G₁ content in c (default
 * 2) and `gamete` its gamete content (dna ÷ 2), each checked. A "?" 2n draws empty cells and a
 * blank table; a "?" dna leaves the DNA row blank.
 */
export interface CellDivisionHe4i {
  content?: { chromatids?: string; dna?: NumOrVar; gamete?: string };
}

/** The variable ids the HC142 option names (for the module tests). */
export function cellDivisionHe4iVars(r: CellDivisionHe4i): string[] {
  const k = r.content;
  return ids(k?.chromatids, k?.dna, k?.gamete);
}

/** HC142: each stage's chromosomes, chromatids and DNA (in c) from 2n and the G₁ content. */
export function divisionStages(diploid: number, g1 = 2) {
  const n = diploid / 2;
  return [
    { stage: 'G₁', chromosomes: diploid, chromatids: diploid, dna: g1 },
    { stage: 'After S', chromosomes: diploid, chromatids: 2 * diploid, dna: 2 * g1 },
    { stage: 'Meiosis I', chromosomes: n, chromatids: diploid, dna: g1 },
    { stage: 'Gamete', chromosomes: n, chromatids: n, dna: g1 / 2 },
  ];
}

// ─── HC144: pedigree, a calculator picture and a card figure ─────────────────────

/**
 * HC144 (B-P6): a family in the standard symbols (squares males, circles females, filled shows
 * the trait, half-filled carries it), `people` as the `pedigree` explore figure lists them,
 * generations numbered I, II, … and people 1, 2, … in each. `chances` writes a value beside a
 * person (the unaffected sibling's 2/3, the partner's carrier chance); `child` draws the
 * couple's next child as a diamond (sex not known) with "?" in it and its chance under it,
 * worked in the caption as the product of the parents' chances × 1/4 (both carriers pass the
 * allele one time in four). Values read as fractions when they are one (bottom to 1000). A
 * "?" chance writes nothing; no handles.
 */
export interface PedigreeSpec {
  kind: 'pedigree';
  people: PedigreePerson[];
  chances?: Record<string, string>;
  child?: { parents: [string, string]; chance: string };
  /** The half-filled carriers are drawn (off: an unaffected carrier looks like anyone). */
  carriers?: boolean;
}

/** The variable ids a pedigree names (for the module tests). */
export function pedigreeVars(r: PedigreeSpec): string[] {
  return ids(...Object.values(r.chances ?? {}), r.child?.chance);
}

/**
 * HC144 (B-P7): a pedigree card, 112 × 76, the same `people` in the standard symbols drawn
 * small (no numbers). With `marked`, the half-filled symbols are every carrier there is, so an
 * empty symbol carries nothing (the layout check reads it so).
 */
export interface PedigreeCard {
  kind: 'pedigree';
  people: PedigreePerson[];
  marked?: boolean;
}

export const PEDIGREE_CARD_W = 112;
export const PEDIGREE_CARD_H = 76;

// ─── HC145: linkageMap (new kind) ───────────────────────────────────────────────

/**
 * HC145 (B-P8): a genetic map. A chromosome bar with 2 or 3 `loci` (names, "A", "B", "C") at
 * `distances` (cM between neighbours) to scale, a cM ruler under it; below, a pair of homologs
 * (one parent's alleles A B C in red, the other's a b c in blue) with the recombinant strands
 * crossed: one crossover between the first two loci, or with `doubles` two crossovers either
 * side of the middle locus (the double crossover that swaps only the middle gene).
 * `recombinant` is the page's recombination frequency between the first two loci in % (checked:
 * 1% recombinants is 1 cM). With three loci, `offspring` (N), `expected` (d₁d₂N ÷ 10⁴ double
 * crossovers), `doubles` (observed), `coincidence` (observed ÷ expected) and `interference`
 * (1 − coincidence) are worked in the caption and checked. A distance over 50 cM draws faded:
 * genes that far apart assort independently. A "?" distance draws no loci.
 */
export interface LinkageMapSpec {
  kind: 'linkageMap';
  loci: string[];
  distances: NumOrVar[];
  recombinant?: NumOrVar;
  offspring?: NumOrVar;
  expected?: string;
  doubles?: NumOrVar;
  coincidence?: string;
  interference?: string;
}

/** The variable ids a linkageMap names (for the module tests). */
export function linkageMapVars(r: LinkageMapSpec): string[] {
  return ids(
    ...r.distances,
    r.recombinant,
    r.offspring,
    r.expected,
    r.doubles,
    r.coincidence,
    r.interference,
  );
}

// ─── HC146: card figure codons ───────────────────────────────────────────────────

/**
 * HC146 (B-P9): a `codons` card, 140 × 74. `mrna` is the old strip (9–12 bases of A, C, G, U:
 * 3–4 codons); `change` the point mutation (`at` counts bases from 1; a substitution or an
 * insertion names its `base`). The old strip is drawn over the new one, each codon boxed with
 * its amino acid, the changed base lit; after an insertion or a deletion the boxes regroup, so
 * the reading frame moves. The layout check reads the effect (silent, missense, nonsense,
 * frameshift) and keeps the card in the bin that names it.
 */
export interface CodonsCard {
  kind: 'codons';
  mrna: string;
  change: { type: 'substitution' | 'insertion' | 'deletion'; at: number; base?: string };
}

export const CODONS_CARD_W = 140;
export const CODONS_CARD_H = 74;

// ─── HC147: geneExpression corepressor ───────────────────────────────────────────

/**
 * HC147 (B-P11): `corepressor` on a `geneExpression` scene (a repressor switch). The signal is
 * then a corepressor (tryptophan for the trp operon): the repressor binds the operator only with
 * it bound, so the gene is off when the signal is there and on when it is not, the reverse of
 * an inducer (`geneIsOn` in `typesHs2e.ts`).
 */
export interface GeneSceneHe4i {
  corepressor?: boolean;
}

// ─── HC149: fieldOfView resolution ───────────────────────────────────────────────

/**
 * HC149 (B-P13): `resolution` on `fieldOfView`, a picture of its own (it has no `field` or
 * `across`). Two points `gap` apart seen through the eyepiece, each blurred to an Airy disk
 * whose first dark ring is at radius `d` (the resolution limit), on the same nm scale as the
 * brightness along the line through them under it (the two disks added). Drawn as resolved
 * exactly when gap ≥ d: two spots with a dip between them (just resolved within 2% of d, the
 * Rayleigh dip), else one blob. `wavelength` and `na` (when given) work d = 0.61λ ÷ NA in the
 * caption; `objective`, `eyepiece` and `total` its magnification (each checked). A "?" d or gap
 * draws no spots.
 */
export interface FieldResolutionHe4i {
  kind: 'fieldOfView';
  field?: undefined;
  across?: undefined;
  size?: undefined;
  resolution: {
    d: NumOrVar;
    gap: NumOrVar;
    wavelength?: NumOrVar;
    na?: NumOrVar;
    objective?: NumOrVar;
    eyepiece?: NumOrVar;
    total?: string;
  };
}

/** The variable ids a resolution field names (for the module tests). */
export function fieldResolutionVars(r: FieldResolutionHe4i): string[] {
  const q = r.resolution;
  return ids(q.d, q.gap, q.wavelength, q.na, q.objective, q.eyepiece, q.total);
}
