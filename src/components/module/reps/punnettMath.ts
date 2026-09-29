/**
 * The boxes of the Grade 9 Punnett squares (H35, group HG), shared with the harness. A parent is
 * a count of dominant alleles per gene (2, 1 or 0: AA, Aa, aa); a gamete takes one allele of each
 * gene. Every box is one equally likely offspring.
 */

/** A parent's two alleles for one gene, dominant first: true is the dominant allele. */
export const allelesFrom = (count: number): [boolean, boolean] => [count >= 1, count >= 2];

/** The four gametes of a dihybrid parent (A1B1, A1B2, A2B1, A2B2). */
export const gametesOf = (a: number, b: number): [boolean, boolean][] => {
  const [a1, a2] = allelesFrom(a);
  const [b1, b2] = allelesFrom(b);
  return [
    [a1, b1],
    [a1, b2],
    [a2, b1],
    [a2, b2],
  ];
};

/** A dihybrid box: dominant alleles of each gene (0–2). */
export interface DiBox {
  a: number;
  b: number;
}

/** The 16 boxes, row by row: the second parent's gametes down the side, the first's across. */
export function dihybridBoxes(p: number, q: number, pB: number, qB: number): DiBox[][] {
  const top = gametesOf(p, pB);
  const side = gametesOf(q, qB);
  return side.map(([sa, sb]) => top.map(([ta, tb]) => ({ a: +sa + +ta, b: +sb + +tb })));
}

/** The four phenotype classes: both dominant, first only, second only, neither. */
export const classOf = (box: DiBox) => (box.a ? (box.b ? 0 : 1) : box.b ? 2 : 3);

/** Counts of the four classes among the 16 boxes. */
export const dihybridCounts = (boxes: DiBox[][]) => {
  const counts = [0, 0, 0, 0];
  for (const box of boxes.flat()) counts[classOf(box)]!++;
  return counts;
};

/** The 4 boxes of a one-gene cross, each its count of the first allele (2, 1 or 0). */
export function monoBoxes(p: number, q: number): number[][] {
  const top = allelesFrom(p);
  const side = allelesFrom(q);
  return side.map((s) => top.map((t) => +s + +t));
}

/** An X-linked box: a daughter (two X) or a son (the mother's X and the father's Y). */
export interface XBox {
  son: boolean;
  /** Dominant alleles on the X chromosomes (a son has one X). */
  dominant: number;
  affected: boolean;
  carrier: boolean;
}

/**
 * The 4 boxes of an X-linked cross: the father's X and Y across the top (his X dominant when
 * `father` is 1), the mother's two X down the side (`mother` dominant alleles, 0–2).
 */
export function xBoxes(mother: number, father: number): XBox[][] {
  const side = allelesFrom(mother);
  const fx = father >= 1;
  return side.map((m) => [
    { son: false, dominant: +m + +fx, affected: !m && !fx, carrier: m !== fx },
    { son: true, dominant: +m, affected: !m, carrier: false },
  ]);
}
