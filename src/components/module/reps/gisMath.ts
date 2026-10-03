/**
 * The math of the GIS options of `coordinatePlane` (HC77, EG-P26): the shoelace area, a
 * buffer's area and the mean centre with its standard distance. The picture, the harness and
 * the gallery demos use these.
 */

type Pt = readonly [number, number];

/** Each cross term xᵢyᵢ₊₁ − xᵢ₊₁yᵢ round the polygon (the last back to the first). */
export const shoelaceTerms = (pts: readonly Pt[]) =>
  pts.map(([x1, y1], i) => {
    const [x2, y2] = pts[(i + 1) % pts.length]!;
    return x1 * y2 - x2 * y1;
  });

/** Area = ½|Σ (xᵢyᵢ₊₁ − xᵢ₊₁yᵢ)|. */
export const shoelaceArea = (pts: readonly Pt[]) =>
  Math.abs(shoelaceTerms(pts).reduce((a, b) => a + b, 0)) / 2;

/** Whether two sides that don't share a corner cross (the shoelace then miscounts). */
export function sidesCross(pts: readonly Pt[]): boolean {
  const n = pts.length;
  const orient = (a: Pt, b: Pt, c: Pt) =>
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      const [a, b, c, d] = [pts[i]!, pts[(i + 1) % n]!, pts[j]!, pts[(j + 1) % n]!];
      const [o1, o2, o3, o4] = [orient(a, b, c), orient(a, b, d), orient(c, d, a), orient(c, d, b)];
      if (o1 * o2 < 0 && o3 * o4 < 0) return true;
    }
  return false;
}

/** A line's buffer with round ends: 2rL + πr² (a point's: πr²). */
export const bufferArea = (L: number, r: number) => 2 * r * L + Math.PI * r * r;

/** The mean centre (x̄, ȳ). */
export const meanCenter = (pts: readonly Pt[]): [number, number] => [
  pts.reduce((a, p) => a + p[0], 0) / pts.length,
  pts.reduce((a, p) => a + p[1], 0) / pts.length,
];

/** Standard distance √(Σ((x − x̄)² + (y − ȳ)²) ÷ n). */
export function standardDistance(pts: readonly Pt[]): number {
  const [mx, my] = meanCenter(pts);
  return Math.sqrt(pts.reduce((a, [x, y]) => a + (x - mx) ** 2 + (y - my) ** 2, 0) / pts.length);
}
