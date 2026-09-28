/** One arc on a hops number line: part of a hop (a whole `tick`, or what is left over). */
export type Arc = { hop: number; from: number; to: number; level: number };

/**
 * Splits each hop into one arc per `tick` (a ten, or a hundred) plus the rest, and gives each
 * hop a level: a hop over a stretch an earlier hop already covers arcs one level higher.
 * Hops.tsx draws these; the harness checks they land on the stops.
 */
export function hopArcs(stops: number[], signs: number[], tick: number): Arc[] {
  const arcs: Arc[] = [];
  signs.forEach((sign, hop) => {
    const size = Math.abs(stops[hop + 1]! - stops[hop]!);
    const whole = Math.floor(size / tick + 1e-9);
    const parts = [
      ...Array.from({ length: whole }, () => tick),
      ...(size - whole * tick > 1e-9 ? [size - whole * tick] : []),
    ];
    const lo = Math.min(stops[hop]!, stops[hop + 1]!);
    const hi = Math.max(stops[hop]!, stops[hop + 1]!);
    const level = arcs
      .filter(
        (x) =>
          x.hop < hop && Math.min(x.from, x.to) < hi - 1e-9 && Math.max(x.from, x.to) > lo + 1e-9,
      )
      .reduce((m, x) => Math.max(m, x.level + 1), 0);
    let at = stops[hop]!;
    for (const part of parts) {
      arcs.push({ hop, from: at, to: at + sign * part, level });
      at += sign * part;
    }
  });
  return arcs;
}
