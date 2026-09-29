/**
 * Picture specs for Grades 9–12, group H (biology H37–H42; see docs/RENDERINGS_HS.md), kept
 * apart from `types.ts` so that file's union only lists them. A `NumOrVar` field is a fixed
 * number or a variable id.
 */
import type { NumOrVar } from './typesGraphs';

/** One lane of a gel: its name over the well and its fragments' sizes in base pairs. */
export interface GelLane {
  label: string;
  bands: NumOrVar[];
}

/**
 * Gel electrophoresis, or PCR doubling the copies each cycle.
 *
 * Gel (`lanes`): an agarose slab with the wells at the − end, a ladder lane of known sizes and
 * the sample lanes; every band sits at a distance on a log scale of its size (each × 10 the
 * same distance, the shortest pieces farthest toward +). Drag a sample band up or down to
 * change a typed size; `keep` pins values during the drag, `fixed` draws no handles.
 *
 * PCR (`pcr`): one cycle's three steps (separate at 95 °C, primers bind at 55 °C, copy at
 * 72 °C), then a row per cycle with every double strand drawn (the original strands dark, the
 * new ones in the highlight) while the count fits, and N = N₀ × 2ⁿ.
 */
export interface GelSpec {
  kind: 'gel';
  /** The sample lanes, left to right after the ladder (1 to 6, up to 6 bands each). */
  lanes?: GelLane[];
  /** The ladder's sizes in bp, or false for no ladder (default 100 bp to 10,000 bp). */
  ladder?: number[] | false;
  /** The ladder lane's name ("Ladder"). */
  ladderLabel?: string;
  /** Values held still while a band is dragged. */
  keep?: string[];
  /** No handles (a page whose sizes a drag can't solve backwards). */
  fixed?: boolean;
  /** PCR instead of a gel: cycles n, starting copies N₀ (default 1) and the copies N after. */
  pcr?: { cycles: NumOrVar; start?: NumOrVar; copies?: NumOrVar };
}

/**
 * Hardy–Weinberg: the allele frequencies p and q as glass beads in a tray of 100 alleles (the
 * dominant allele's beads in the highlight, the recessive's in the second color, counted from
 * p), a p scale under the tray with a handle, and the genotype bars p², 2pq and q² on a 0–1
 * scale beside it (the heterozygote bar half one color, half the other).
 */
export interface AlleleFrequenciesSpec {
  kind: 'alleleFrequencies';
  /** The dominant allele's frequency p (0 to 1). */
  p: NumOrVar;
  /** The recessive allele's frequency q, when the page names it (checked: p + q = 1). */
  q?: NumOrVar;
  /** Variables holding p², 2pq and q², when the page works them out (checked). */
  genotypes?: [NumOrVar | null, NumOrVar | null, NumOrVar | null];
  /** The allele letters (default A and a). */
  alleles?: [string, string];
  /** Values held still while p is dragged. */
  keep?: string[];
  /** No handle. */
  fixed?: boolean;
}

/**
 * Antibody levels over time after a first and a second exposure to one antigen: the first
 * response slow and low, the second (from memory cells) faster and higher. Each response rises
 * to its peak `days` after its exposure and falls away, the second more slowly; the curve drawn
 * is the higher of the two at each day. Peaks are marked with their levels and days.
 */
export interface ImmuneResponseSpec {
  kind: 'immuneResponse';
  /** Peak antibody level after the first exposure. */
  first: NumOrVar;
  /** Peak antibody level after the second exposure. */
  second: NumOrVar;
  /** Days from the first exposure to its peak (default 12). */
  firstDays?: NumOrVar;
  /** Days from the second exposure to its peak (default 6). */
  secondDays?: NumOrVar;
  /** Day of the second exposure (default 40). */
  secondAt?: NumOrVar;
  /** The level's name on the axis (default "Antibody level"). */
  axis?: string;
}

export type HshSpec = GelSpec | AlleleFrequenciesSpec | ImmuneResponseSpec;

/** The variable ids a spec above names (for the module tests). */
export function hshSpecVars(r: HshSpec): string[] {
  const ids = (xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'gel':
      return ids([
        ...(r.lanes ?? []).flatMap((l) => l.bands),
        ...(r.keep ?? []),
        r.pcr?.cycles,
        r.pcr?.start,
        r.pcr?.copies,
      ]);
    case 'alleleFrequencies':
      return ids([r.p, r.q, ...(r.genotypes ?? []).map((g) => g ?? undefined), ...(r.keep ?? [])]);
    case 'immuneResponse':
      return ids([r.first, r.second, r.firstDays, r.secondDays, r.secondAt]);
  }
}

/** A cladogram's tree: a taxon's name, or a clade as its two or more branches. */
export type CladeTree = string | CladeTree[];

/** A shared derived trait and the taxa that have it (they must make one clade). */
export interface CladeTrait {
  name: string;
  taxa: string[];
}

/**
 * What a `cladogram` scene lights: a trait (its mark, the branch where it appears and the whole
 * clade that inherits it), and taxa ringed (a group to ask about: is it a clade?).
 */
export interface CladeScene {
  lit?: string;
  ring?: string[];
}

/** The processes of a `nitrogenCycle` figure. */
export type NitrogenProcess =
  | 'fixation'
  | 'lightning'
  | 'nitrification'
  | 'assimilation'
  | 'eating'
  | 'ammonification'
  | 'denitrification';

/** One box of a `feedbackLoop`: its role ("Sensor"), if it has one, and what happens there. */
export interface LoopStep {
  role?: string;
  text: string;
}

/**
 * A `feedbackLoop` scene: the steps in order (3 to 6), whether the response works against the
 * change (negative feedback) or adds to it (positive), the step lit (0 first), and a label for
 * the arrow back from the response to the start.
 */
export interface LoopScene {
  steps: LoopStep[];
  sign: 'negative' | 'positive';
  lit?: number;
  back?: string;
}

/** The stages an `immuneStages` figure lights. */
export type ImmuneStage = 'antigen' | 'helperT' | 'bCells' | 'antibodies' | 'killerT' | 'memory';
