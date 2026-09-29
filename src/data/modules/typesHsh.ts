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

export type HshSpec = GelSpec;

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
  }
}
