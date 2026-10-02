/**
 * The numbers behind the `survey` picture (HC32, `typesHe2i.ts`): latitudes and departures,
 * a traverse's stations (closed by the compass rule for drawing), leveling, and the earth's
 * curvature. Shared by the picture and its harness check.
 */

const D = Math.PI / 180;

/** A course's latitude (north +) and departure (east +) from its azimuth (degrees) and length. */
export const latDep = (azimuth: number, length: number) => ({
  lat: length * Math.cos(azimuth * D),
  dep: length * Math.sin(azimuth * D),
});

/**
 * The stations of a traverse from A at (0, 0), as [east, north], each course in turn. With
 * `close`, the courses' own misclosure is shared out by the compass rule so the drawn polygon
 * ends back on A (its shape is the page's; a measured gap is drawn apart).
 */
export function stations(
  courses: { azimuth: number; length: number }[],
  close = false,
): [number, number][] {
  const pts: [number, number][] = [[0, 0]];
  for (const c of courses) {
    const { lat, dep } = latDep(c.azimuth, c.length);
    const [e, n] = pts[pts.length - 1]!;
    pts.push([e + dep, n + lat]);
  }
  if (!close) return pts;
  const P = courses.reduce((s, c) => s + c.length, 0);
  const [me, mn] = pts[pts.length - 1]!;
  let run = 0;
  return pts.map(([e, n], k) => {
    if (k > 0) run += courses[k - 1]!.length;
    const f = P > 0 ? run / P : 0;
    return [e - me * f, n - mn * f];
  });
}

/** Linear misclosure and relative precision 1 : P ÷ e. */
export const closureOf = (sumLat: number, sumDep: number, P: number) => {
  const e = Math.hypot(sumLat, sumDep);
  return { e, precision: e > 0 ? P / e : Infinity };
};

/** Compass-rule corrections to one course: −Σlat × L ÷ P and −Σdep × L ÷ P. */
export const compassCorrection = (sumLat: number, sumDep: number, L: number, P: number) => ({
  cLat: P > 0 ? (-sumLat * L) / P : NaN,
  cDep: P > 0 ? (-sumDep * L) / P : NaN,
});

/** Differential leveling with two setups. */
export function levelRun(BM: number, BS1: number, FS1: number, BS2: number, FS2: number) {
  const HI1 = BM + BS1;
  const TP = HI1 - FS1;
  const HI2 = TP + BS2;
  const B = HI2 - FS2;
  return { HI1, TP, HI2, B };
}
