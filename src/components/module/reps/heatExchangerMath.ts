/**
 * The arithmetic a `heatExchanger` picture draws (HC40), shared with its harness check. With U
 * constant along the exchanger, the local difference ΔT(x) = T_h − T_c changes exponentially from
 * ΔT₁ at the hot inlet's end (x = 0) to ΔT₂ at the other (x = L), and its mean over the length is
 * the LMTD. Each stream's temperature moves in step with the heat passed so far.
 */

export type Arrangement = 'counter' | 'parallel';

export interface Temps {
  Thi: number;
  Tho: number;
  Tci: number;
  Tco: number;
}

/** ΔT₁ at x = 0 (where the hot stream enters) and ΔT₂ at x = L. */
export function endDiffs(arr: Arrangement, t: Temps): [number, number] {
  return arr === 'counter' ? [t.Thi - t.Tco, t.Tho - t.Tci] : [t.Thi - t.Tci, t.Tho - t.Tco];
}

/** The log-mean temperature difference; ΔT₁ itself when the two ends are equal. */
export function lmtd(d1: number, d2: number): number {
  if (!(d1 > 0) || !(d2 > 0)) return NaN;
  if (Math.abs(d1 - d2) <= 1e-9 * Math.max(d1, d2)) return (d1 + d2) / 2;
  return (d1 - d2) / Math.log(d1 / d2);
}

/** The local difference at x (0 to 1 of the length). */
export const localDiff = (x: number, d1: number, d2: number) => d1 * (d2 / d1) ** x;

/** The fraction of the heat passed between x = 0 and x. */
export function heatFraction(x: number, d1: number, d2: number): number {
  if (Math.abs(d1 - d2) <= 1e-9 * Math.max(d1, d2)) return x;
  return (d1 - localDiff(x, d1, d2)) / (d1 - d2);
}

/** Where along the length (0 to 1) the local difference equals the LMTD. */
export function lmtdPosition(d1: number, d2: number): number {
  if (Math.abs(d1 - d2) <= 1e-9 * Math.max(d1, d2)) return 0.5;
  return Math.log(d1 / lmtd(d1, d2)) / Math.log(d1 / d2);
}

/** Both streams' temperatures at n + 1 points along the length. */
export function profiles(arr: Arrangement, t: Temps, n = 40) {
  const [d1, d2] = endDiffs(arr, t);
  return [...Array(n + 1).keys()].map((i) => {
    const x = i / n;
    const f = heatFraction(x, d1, d2);
    const Th = t.Thi - (t.Thi - t.Tho) * f;
    const Tc = arr === 'counter' ? t.Tco - (t.Tco - t.Tci) * f : t.Tci + (t.Tco - t.Tci) * f;
    return { x, Th, Tc };
  });
}

/**
 * Why the temperatures can't be an exchanger of this arrangement, or undefined: the hot stream
 * must cool, the cold one warm, and the hot line stay above the cold all along (no cross).
 */
export function tempsProblem(arr: Arrangement, t: Temps): string | undefined {
  if (t.Tho > t.Thi) return 'the hot stream would leave warmer than it came in';
  if (t.Tco < t.Tci) return 'the cold stream would leave colder than it came in';
  const [d1, d2] = endDiffs(arr, t);
  if (d1 <= 0 || d2 <= 0)
    return arr === 'parallel' && t.Tco > t.Tho
      ? 'in parallel flow the cold outlet can’t pass the hot outlet'
      : 'the hot line would cross the cold one';
  return undefined;
}

/** Counterflow effectiveness from NTU and C_r = C_min ÷ C_max. */
export function counterEffectiveness(ntu: number, cr: number): number {
  if (Math.abs(1 - cr) < 1e-9) return ntu / (1 + ntu);
  const e = Math.exp(-ntu * (1 - cr));
  return (1 - e) / (1 - cr * e);
}

/** Parallel-flow effectiveness from NTU and C_r. */
export const parallelEffectiveness = (ntu: number, cr: number) =>
  (1 - Math.exp(-ntu * (1 + cr))) / (1 + cr);
