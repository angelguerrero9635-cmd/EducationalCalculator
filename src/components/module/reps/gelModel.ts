/**
 * The numbers behind the `gel` picture (Gel.tsx), shared with its harness check
 * (harness/picturesHsh.ts): where a band sits for its size, and PCR's copies cycle by cycle.
 */

/** The default ladder, in base pairs: 100 bp to 10,000 bp. */
export const GEL_LADDER = [10000, 7000, 5000, 3000, 2000, 1500, 1000, 700, 500, 300, 200, 100];

/** Most sample lanes and most bands in one lane. */
export const GEL_LANES = 6;
export const GEL_BANDS = 6;

/** The sizes a gel shows, from the largest (nearest the wells) to the smallest, in bp. */
export interface GelWindow {
  hi: number;
  lo: number;
}

/** A window a little past the largest and smallest sizes, so no band sits on an edge. */
export function gelWindow(sizes: number[]): GelWindow {
  const ok = sizes.filter((s) => s > 0 && Number.isFinite(s));
  const hi = Math.max(...ok, 1000);
  const lo = Math.min(...ok, hi / 10);
  return { hi: hi * 1.2, lo: lo / 1.2 };
}

/**
 * How far down the gel a band of `bp` runs, as a share of the running length (0 at the wells,
 * 1 at the far end): the distance falls with the log of the size, so each × 10 in size is the
 * same step. (Over a gel's working range, distance is close to linear in log size.)
 */
export const bandAt = (bp: number, win: GelWindow) =>
  (Math.log10(win.hi) - Math.log10(bp)) / (Math.log10(win.hi) - Math.log10(win.lo));

/** The size of a band at share `t` of the running length (the inverse of `bandAt`). */
export const sizeAt = (t: number, win: GelWindow) =>
  10 ** (Math.log10(win.hi) - t * (Math.log10(win.hi) - Math.log10(win.lo)));

/** Most double strands drawn in one PCR row. */
export const PCR_DRAWN = 32;

/**
 * PCR's rows: for each cycle k from 0 while start × 2ᵏ copies fit in a row (up to `cycles`),
 * every double strand as [age of one strand, age of the other], where age 0 is an original
 * strand and age k was copied in cycle k. Each cycle splits every double strand and copies both
 * halves: (a, b) → (a, k) and (b, k).
 */
export function pcrRows(start: number, cycles: number): [number, number][][] {
  const n0 = Math.max(0, Math.round(start));
  // More starting copies than a row holds: no row is drawn, only the counts.
  if (n0 > PCR_DRAWN) return [];
  const rows: [number, number][][] = [Array.from({ length: n0 }, () => [0, 0] as [number, number])];
  for (let k = 1; k <= cycles; k++) {
    const prev = rows[rows.length - 1]!;
    if (prev.length * 2 > PCR_DRAWN) break;
    rows.push(prev.flatMap(([a, b]) => [[a, k] as [number, number], [b, k] as [number, number]]));
  }
  return rows;
}

/** Superscript digits for an exponent (2³⁰). */
export const superscript = (n: number) =>
  String(n)
    .replace(/-/g, '⁻')
    .replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!);
