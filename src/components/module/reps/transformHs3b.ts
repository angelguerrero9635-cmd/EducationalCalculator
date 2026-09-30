/**
 * H106 (round 3, group B): a figure's own center and its point symmetry, for `transformation`
 * with `about: 'center'`. Plain math, shared by the picture and the harness.
 */
import { coef } from './lineParabola';
import type { Pt } from './transform';

/** The corners' average: the center a figure turns about for its own symmetry. */
export const ownCenter = (ps: Pt[]): Pt => [
  ps.reduce((s, p) => s + p[0], 0) / Math.max(1, ps.length),
  ps.reduce((s, p) => s + p[1], 0) / Math.max(1, ps.length),
];

/** For each corner, the corner straight across the center (−1 when there is none). */
export function pointPartners(ps: Pt[], c: Pt): number[] {
  return ps.map((p) => {
    const q: Pt = [2 * c[0] - p[0], 2 * c[1] - p[1]];
    return ps.findIndex((r) => Math.hypot(r[0] - q[0], r[1] - q[1]) < 1e-6);
  });
}

/** The caption: point symmetric about the center, or not. */
export function pointSymmetryText(ps: Pt[], c: Pt): string {
  const partners = pointPartners(ps, c);
  const at = `(${coef(c[0])}, ${coef(c[1])})`;
  return partners.every((i) => i >= 0)
    ? `Point symmetry about its center ${at}: every corner has a partner straight across it, the same distance away, so a half turn swaps them.`
    : `No point symmetry about ${at}: a corner has no partner straight across the center.`;
}
