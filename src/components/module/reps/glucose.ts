/** Glucose's 24 atoms for the `reaction` picture with `many` (H100); checked in harness/picturesHs2e.ts. */
import type { Molecule } from './chem';

/**
 * β-glucose as a flat ring (bond length 1, y down): the ring O top right, C1 to C5 round the
 * ring, C6 above C5 with its OH; an OH on C1 to C4 pointing out and an H on each ring carbon
 * set back (drawn a little behind). 6 C, 12 H, 6 O: 24 atoms.
 */
export const GLUCOSE: Molecule = (() => {
  const atoms: Molecule['atoms'] = [];
  const bonds: Molecule['bonds'] = [];
  const add = (el: string, x: number, y: number, z = 0) => atoms.push({ el, x, y, z }) - 1;
  const ring = [30, -30, -90, -150, 150, 90].map((deg) => {
    const t = (deg * Math.PI) / 180;
    return [Math.cos(t), -Math.sin(t)] as const;
  });
  // Ring order: O5 (top right), C1 (bottom right), C2 (bottom), C3, C4, C5 (top).
  const [o5, c1, c2, c3, c4, c5] = ring.map(([x, y], k) => add(k === 0 ? 'O' : 'C', x, y));
  const cycle = [o5!, c1!, c2!, c3!, c4!, c5!];
  cycle.forEach((a, k) => bonds.push([a, cycle[(k + 1) % 6]!, 1]));
  // OH out from C1–C4, and an H on each ring carbon, turned a little and behind.
  [c1!, c2!, c3!, c4!].forEach((ci, k) => {
    const [ux, uy] = ring[k + 1]!;
    const up = k % 2 === 0 ? 1 : -1;
    const o = add('O', ring[k + 1]![0] + 0.95 * ux, ring[k + 1]![1] + 0.95 * uy);
    bonds.push([ci, o, 1]);
    const h = add(
      'H',
      atoms[o]!.x + 0.7 * ux - 0.3 * uy * up,
      atoms[o]!.y + 0.7 * uy + 0.3 * ux * up,
    );
    bonds.push([o, h, 1]);
    const hc = add(
      'H',
      ring[k + 1]![0] + 0.45 * ux + 0.5 * uy * up,
      ring[k + 1]![1] + 0.45 * uy - 0.5 * ux * up,
      -1,
    );
    bonds.push([ci, hc, 1]);
  });
  const h5 = add('H', -0.75, -1.35, -1);
  bonds.push([c5!, h5, 1]);
  // C6 above C5, its two H and its OH.
  const c6 = add('C', 0, -2);
  bonds.push([c5!, c6, 1]);
  const o6 = add('O', 0.85, -2.5);
  bonds.push([c6, o6, 1]);
  const h6 = add('H', 1.6, -2.15);
  bonds.push([o6, h6, 1]);
  const h6a = add('H', -0.85, -2.45, -1);
  bonds.push([c6, h6a, 1]);
  const h6b = add('H', -0.15, -2.85, -1);
  bonds.push([c6, h6b, 1]);
  return { atoms, bonds };
})();
