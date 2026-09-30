/** The side-splitter's triangle (ScaleCopyHsf.tsx), shared with the harness. */

type Pt = [number, number];

/** The angle at A drawn when the page gives no BC (degrees). */
export const SPLITTER_ANGLE = 50;

/**
 * Triangle ABC from its sides AB and AC and, when given, BC (else the angle at A is 50°): A on
 * top, BC level along the bottom, in the sides' units with y pointing down. Sides that don't
 * close give no triangle and the reason.
 */
export function splitterShape(
  AB: number,
  AC: number,
  BC?: number,
): { tri?: [Pt, Pt, Pt]; reason: string } {
  if (!(AB > 0) || !(AC > 0)) return { reason: 'AB and AC must be longer than 0' };
  const a =
    BC ?? Math.sqrt(AB * AB + AC * AC - 2 * AB * AC * Math.cos((SPLITTER_ANGLE * Math.PI) / 180));
  if (!(a > 0) || a >= AB + AC || AB >= a + AC || AC >= a + AB)
    return { reason: `Sides ${AB}, ${AC} and ${a} don't close into a triangle` };
  const x = (AB * AB - AC * AC + a * a) / (2 * a);
  const y = Math.sqrt(Math.max(0, AB * AB - x * x));
  return {
    tri: [
      [x, -y],
      [0, 0],
      [a, 0],
    ],
    reason: '',
  };
}
