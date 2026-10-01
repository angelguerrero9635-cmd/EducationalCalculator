/**
 * Vectors in space (H106): the products the picture and the harness both work out, and the view
 * that flattens x, y, z onto the screen. Pure.
 */
export type V3 = [number, number, number];

export const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale3 = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const len3 = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const cross3 = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
/** The angle between two vectors in degrees (undefined for a zero vector). */
export function angle3(a: V3, b: V3): number | undefined {
  const m = len3(a) * len3(b);
  if (!(m > 0)) return undefined;
  return (Math.acos(Math.max(-1, Math.min(1, dot3(a, b) / m))) * 180) / Math.PI;
}

/**
 * The view from above and to one side: `turn` (degrees) spins the camera about z, `tilt` lifts
 * it. At turn 30° the x-axis runs toward the reader (down and left), y to the right, z up.
 * Returns the screen offset (right, up) of a point and its depth (toward the reader).
 */
export function viewOf(turn: number, tilt = 22) {
  const [a, e] = [(turn * Math.PI) / 180, (tilt * Math.PI) / 180];
  const right: V3 = [-Math.sin(a), Math.cos(a), 0];
  const up: V3 = [-Math.sin(e) * Math.cos(a), -Math.sin(e) * Math.sin(a), Math.cos(e)];
  const toward: V3 = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
  return (p: V3) => ({ x: dot3(p, right), y: dot3(p, up), depth: dot3(p, toward) });
}
