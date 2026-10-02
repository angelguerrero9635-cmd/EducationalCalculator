/**
 * The `strobe` card figure (H102, group H2C): a motion diagram, the object's place every second
 * as a dot, the gaps between them the distances covered each second. Pure data and geometry;
 * drawn by `components/module/layouts/strobeCard.tsx`.
 */

/**
 * A motion diagram on a sort card: dots one second apart with `gaps` (m) between them, drawn
 * to scale, the first dot open. `dir` is the way it moves (default right); `ramp` tilts the
 * track up the way it moves (a ball rolling up a slope).
 */
export interface StrobeCard {
  kind: 'strobe';
  gaps: number[];
  dir?: 'right' | 'left';
  ramp?: boolean;
}

/** Card size (px): wide enough to tell 1 m gaps from 2 m ones. */
export const STROBE_W = 140;
export const STROBE_H = 48;

/** How far the track rises across the card when it is a ramp (px). */
const RISE = 16;

/** The least distance between two dots' centers (px), so 1 m beside 7 m never overlaps. */
export const STROBE_MIN_GAP = 10;

/**
 * Each dot's center in a STROBE_W × STROBE_H card along the track from the start (left, or
 * right when moving left), the track tilted up the way it moves on a ramp. Each gap is
 * STROBE_MIN_GAP plus its share of the rest of the track: longer gaps are longer by their
 * difference in meters, and the shortest still leaves room between its dots.
 */
export function strobeDots(f: StrobeCard): { x: number; y: number }[] {
  const total = f.gaps.reduce((s, g) => s + Math.max(0, g), 0) || 1;
  const [x0, x1] = [10, STROBE_W - 10];
  const moving = f.gaps.filter((g) => g > 0).length;
  const min = Math.min(STROBE_MIN_GAP, (x1 - x0) / Math.max(1, moving));
  const rest = x1 - x0 - min * moving;
  const left = f.dir === 'left';
  let at = 0;
  return [0, ...f.gaps].map((g, i) => {
    if (i > 0 && g > 0) at += min + (g / total) * rest;
    const u = at / (x1 - x0);
    const x = left ? x1 - u * (x1 - x0) : x0 + u * (x1 - x0);
    const y = 32 - (f.ramp ? u * RISE : 0);
    return { x, y };
  });
}

/** What is wrong with a strobe card, for the layout tests. */
export function strobeCardProblems(f: StrobeCard): string[] {
  const out: string[] = [];
  if (f.gaps.length < 2 || f.gaps.length > 8) out.push(`strobe of ${f.gaps.length} gaps (2 to 8)`);
  if (f.gaps.some((g) => !Number.isFinite(g) || g < 0)) out.push('strobe gap not a distance');
  const total = f.gaps.reduce((s, g) => s + g, 0);
  // Dots closer than their own size can't be told apart.
  const dots = strobeDots(f);
  if (
    f.gaps.some(
      (g, i) => g > 0 && Math.hypot(dots[i + 1]!.x - dots[i]!.x, dots[i + 1]!.y - dots[i]!.y) < 8,
    )
  )
    out.push('strobe gap too small to see beside the others');
  if (total <= 0) out.push('strobe with no motion');
  return out;
}
