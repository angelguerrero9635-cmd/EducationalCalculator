/**
 * The roller coaster's track for the energy picture: heights as a fraction of the first
 * hill's top across u = 0 … 1 — a platform, the big drop, a smaller hill, a drop to the
 * ground and a flat run out. Each piece eases like a cosine, so the track is smooth.
 */

/** [from u, to u, from height, to height] for each piece. */
export const TRACK: [number, number, number, number][] = [
  [0, 0.1, 1, 1],
  [0.1, 0.45, 1, 0],
  [0.45, 0.72, 0, 0.55],
  [0.72, 0.95, 0.55, 0],
  [0.95, 1, 0, 0],
];

const ease = (s: number) => (1 - Math.cos(Math.PI * s)) / 2;

/** Which piece u is on. */
export const pieceOf = (u: number) =>
  Math.max(
    0,
    TRACK.findIndex(([a, b]) => u >= a && u <= b),
  );

/** The track's height (a fraction of the top) at u. */
export function trackY(u: number): number {
  const [a, b, ya, yb] = TRACK[pieceOf(Math.min(1, Math.max(0, u)))]!;
  return ya + (yb - ya) * ease((u - a) / (b - a || 1));
}

/**
 * Where on the track the height is `y` (a fraction of the top): on `piece` when it reaches
 * that height, else on the big drop (which reaches every height from 0 to the top).
 */
export function trackAt(height: number, piece: number): number {
  const y = Math.max(0, height);
  const on = (i: number) => {
    const [a, b, ya, yb] = TRACK[i]!;
    const lo = Math.min(ya, yb);
    const hi = Math.max(ya, yb);
    if (ya === yb || y < lo - 1e-9 || y > hi + 1e-9) return undefined;
    const s = Math.acos(Math.min(1, Math.max(-1, 1 - (2 * (y - ya)) / (yb - ya)))) / Math.PI;
    return a + (b - a) * s;
  };
  if (y >= 1) return piece === 0 ? 0.05 : 0.1;
  if (y <= 0 && piece === TRACK.length - 1) return 0.975;
  return on(piece) ?? on(1)!;
}
