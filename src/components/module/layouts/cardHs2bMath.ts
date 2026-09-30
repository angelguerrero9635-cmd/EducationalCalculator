/**
 * The geometry behind group H2B's card figures (`typesHs2b.ts`): triangles from their sides,
 * laid side by side at one scale. Shared by cardFiguresHs2b.tsx and the harness. Plain math.
 */
import type { CardSides, MarkedTrianglesCard, TriCorner } from '@/data/modules/typesHs2b';

export type Q = [number, number];

/** Corners A, B, C of a triangle from its sides (A at the origin, B along +x, C above; y up). */
export function cornersOf([a, b, c]: CardSides): [Q, Q, Q] | undefined {
  if (!(a > 0 && b > 0 && c > 0) || a + b <= c || b + c <= a || a + c <= b) return undefined;
  const x = (b * b + c * c - a * a) / (2 * c);
  return [
    [0, 0],
    [c, 0],
    [x, Math.sqrt(Math.max(0, b * b - x * x))],
  ];
}

/** The angle at each corner in degrees. */
export function anglesOf([a, b, c]: CardSides): Record<TriCorner, number> {
  const at = (x: number, y: number, z: number) =>
    (Math.acos(Math.max(-1, Math.min(1, (y * y + z * z - x * x) / (2 * y * z)))) * 180) / Math.PI;
  return { A: at(a, b, c), B: at(b, a, c), C: at(c, a, b) };
}

export const TRI_W = 144;
export const TRI_H = 76;

/**
 * Both triangles in card pixels (y down), each in its half, at one scale; the second turned
 * over when `mirror`. `pad` leaves room round each for labels.
 */
export function layTriangles(f: MarkedTrianglesCard): [Q, Q, Q][] | undefined {
  const tris = f.triangles.map(cornersOf);
  if (tris.some((t) => !t)) return undefined;
  const ts = (tris as [Q, Q, Q][]).map((t, i) =>
    i === 1 && f.mirror ? (t.map(([x, y]) => [-x, y]) as [Q, Q, Q]) : t,
  );
  // Labels sit mostly above and below a side: less room is kept at the sides.
  const padX = f.lengths || f.names ? 10 : 5;
  const padY = f.lengths || f.names ? 14 : 7;
  const box = ts.map((t) => {
    const xs = t.map((p) => p[0]);
    const ys = t.map((p) => p[1]);
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  });
  const wide = box.map((b) => b.x1 - b.x0 || 1);
  // One scale for both, the width shared in proportion to each triangle's width.
  const s = Math.min(
    (TRI_W - 4 * padX) / (wide[0]! + wide[1]!),
    ...box.map((b) => (TRI_H - 2 * padY) / (b.y1 - b.y0 || 1)),
  );
  const spare = (TRI_W - (wide[0]! + wide[1]!) * s) / 4;
  return ts.map((t, i) => {
    const b = box[i]!;
    const left = spare + i * (wide[0]! * s + 2 * spare);
    const bottom = TRI_H - (TRI_H - (b.y1 - b.y0) * s) / 2;
    return t.map(([x, y]) => [left + (x - b.x0) * s, bottom - (y - b.y0) * s]) as [Q, Q, Q];
  });
}
