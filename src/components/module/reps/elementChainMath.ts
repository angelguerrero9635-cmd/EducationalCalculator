/**
 * The arithmetic an `elementChain` picture draws (HC41), shared with its harness check. Forces in
 * N, displacements in mm, stiffness in N/mm. Element e joins node e to node e + 1 (from 1).
 */

/** An element's axial force from its stiffness and its two nodes' displacements (tension +). */
export const elementForce = (k: number, ui: number, uj: number) => k * (uj - ui);

/**
 * What is left over at a node: its load (or reaction) plus the pull of the element on its right
 * less the pull of the one on its left. Zero when the node balances.
 */
export const nodeImbalance = (F: number, fLeft: number | undefined, fRight: number | undefined) =>
  F + (fRight ?? 0) - (fLeft ?? 0);

/** Nodes and degrees of freedom of an n_x × n_y grid of quadrilaterals. */
export const meshCounts = (nx: number, ny: number, perNode = 2) => {
  const nodes = (nx + 1) * (ny + 1);
  return { nodes, dof: perNode * nodes };
};

/** The nodes' displacements: given ones, 0 at fixed nodes, else undefined. */
export function nodeDisplacements(
  count: number,
  fixed: number[],
  given: { node: number; u: number | undefined }[],
): (number | undefined)[] {
  return [...Array(count).keys()].map((i) => {
    const g = given.find((x) => x.node === i + 1);
    if (g) return g.u;
    return fixed.includes(i + 1) ? 0 : undefined;
  });
}
