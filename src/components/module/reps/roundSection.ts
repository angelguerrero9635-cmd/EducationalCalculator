/**
 * Cross-sections of a cylinder and a cone (H27, CrossSectionRound.tsx), shared with the harness.
 * The solid stands on its base with radius r and height h. A 'base' cut is level at height
 * `at`; a 'side' cut is upright, `at` from the axis (0: through it). Plain math, no drawing.
 */

export type RoundSolid = 'cylinder' | 'cone';

/** How far the plane can move: up the height (base) or out to the rim (side). */
export const roundReach = (cut: 'base' | 'side', r: number, h: number) => (cut === 'base' ? h : r);

/** The solid's radius at height z. */
const radiusAt = (solid: RoundSolid, r: number, h: number, z: number) =>
  solid === 'cylinder' ? r : Math.max(0, r * (1 - z / h));

export interface RoundCut {
  name: 'circle' | 'rectangle' | 'triangle' | 'curved' | 'none';
  area: number;
  /** A circle's radius. */
  radius?: number;
  /** A rectangle's or triangle's width and height. */
  width?: number;
  height?: number;
  /**
   * The outline in the plane: (across, up) points, across measured from the axis's foot in the
   * plane, up from the base.
   */
  outline: [number, number][];
}

/** The cut's shape and area. */
export function roundCut(
  solid: RoundSolid,
  cut: 'base' | 'side',
  r: number,
  h: number,
  at: number,
): RoundCut {
  if (cut === 'base') {
    const rho = radiusAt(solid, r, h, at);
    const outline = Array.from({ length: 49 }, (_, i) => {
      const t = (i / 48) * 2 * Math.PI;
      return [rho * Math.cos(t), rho * Math.sin(t)] as [number, number];
    });
    return rho > 1e-9
      ? { name: 'circle', area: Math.PI * rho * rho, radius: rho, outline }
      : { name: 'none', area: 0, outline: [] };
  }
  if (at >= r - 1e-9) return { name: 'none', area: 0, outline: [] };
  if (solid === 'cylinder') {
    const half = Math.sqrt(r * r - at * at);
    return {
      name: 'rectangle',
      area: 2 * half * h,
      width: 2 * half,
      height: h,
      outline: [
        [-half, 0],
        [half, 0],
        [half, h],
        [-half, h],
      ],
    };
  }
  // A cone cut upright: through the axis a triangle, off it a region under a hyperbola.
  const top = h * (1 - at / r);
  const halfAt = (z: number) => Math.sqrt(Math.max(0, radiusAt(solid, r, h, z) ** 2 - at * at));
  const n = 64;
  const right = Array.from({ length: n + 1 }, (_, i) => {
    const z = (i / n) * top;
    return [halfAt(z), z] as [number, number];
  });
  const outline = [
    ...right,
    ...right
      .slice(0, -1)
      .reverse()
      .map(([x, z]) => [-x, z] as [number, number]),
  ];
  if (at < 1e-9) return { name: 'triangle', area: r * h, width: 2 * r, height: h, outline };
  // Simpson's rule on the width 2√(ρ(z)² − d²) from the base to where the plane leaves.
  let area = 0;
  for (let i = 0; i < n; i++) {
    const [z0, z1] = [(i / n) * top, ((i + 1) / n) * top];
    area += ((z1 - z0) / 6) * 2 * (halfAt(z0) + 4 * halfAt((z0 + z1) / 2) + halfAt(z1));
  }
  return { name: 'curved', area, width: 2 * halfAt(0), height: top, outline };
}
