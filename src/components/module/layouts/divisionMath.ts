/**
 * The chromosomes in each cell at each stage of mitosis and meiosis (H34, group HG), shared by
 * the `cellDivision` card figure and the harness. Pair k of a 2n cell is one maternal and one
 * paternal chromosome. Before S phase each chromosome is one chromatid; from prophase on it is
 * two sister chromatids joined at the centromere. In prophase I one inner chromatid of each
 * homolog swaps its tip with the other homolog's (crossing over), so the four cells after
 * meiosis II each get a different mix.
 */
import type { DivisionStage } from '@/data/modules/typesHsg';

export type Parent = 'm' | 'p';
/** One chromatid: whose it is, and whose tip it carries after crossing over. */
export interface Chromatid {
  parent: Parent;
  tip: Parent;
}
export interface Chromosome {
  pair: number;
  chromatids: Chromatid[];
}
export type CellModel = Chromosome[];

/** 2n from a card (2, 4 or 6). */
export const diploidOf = (d?: number) => Math.max(2, Math.min(6, 2 * Math.round((d ?? 4) / 2)));

const MEIOSIS: DivisionStage[] = [
  'prophase I',
  'metaphase I',
  'anaphase I',
  'telophase I',
  'prophase II',
  'metaphase II',
  'anaphase II',
  'telophase II',
];
export const isMeiosis = (s: DivisionStage) => MEIOSIS.includes(s);

const same = (parent: Parent): Chromatid => ({ parent, tip: parent });

/**
 * The cells a stage draws, each its chromosomes. Anaphase stages list the two groups pulled to
 * the poles as two "cells" (they are still one cell), so counts per pole can be checked.
 */
export function cellsOf(stage: DivisionStage, diploid?: number): CellModel[] {
  const n = diploidOf(diploid) / 2;
  const pairs = Array.from({ length: n }, (_, k) => k);
  const dup = (pair: number, a: Chromatid, b: Chromatid): Chromosome => ({
    pair,
    chromatids: [a, b],
  });
  const single = (pair: number, a: Chromatid): Chromosome => ({ pair, chromatids: [a] });
  switch (stage) {
    case 'interphase':
      return [pairs.flatMap((k) => [single(k, same('m')), single(k, same('p'))])];
    case 'prophase':
    case 'metaphase':
      return [pairs.flatMap((k) => [dup(k, same('m'), same('m')), dup(k, same('p'), same('p'))])];
    case 'anaphase':
    case 'telophase':
    case 'cytokinesis': {
      const half = pairs.flatMap((k) => [single(k, same('m')), single(k, same('p'))]);
      return [half, half.map((c) => ({ ...c }))];
    }
  }
  // Meiosis: crossed-over homologs. Maternal: [M, M with a paternal tip]; paternal: [P with a
  // maternal tip, P].
  const mat = (k: number) => dup(k, same('m'), { parent: 'm', tip: 'p' });
  const pat = (k: number) => dup(k, { parent: 'p', tip: 'm' }, same('p'));
  // Independent assortment: pair k's maternal homolog goes left when k is even.
  const left = pairs.map((k) => (k % 2 === 0 ? mat(k) : pat(k)));
  const right = pairs.map((k) => (k % 2 === 0 ? pat(k) : mat(k)));
  const sisters = (cell: Chromosome[], i: 0 | 1) =>
    cell.map((c) => single(c.pair, c.chromatids[i]!));
  switch (stage) {
    case 'prophase I':
    case 'metaphase I':
      return [pairs.flatMap((k) => [mat(k), pat(k)])];
    case 'anaphase I':
    case 'telophase I':
    case 'prophase II':
    case 'metaphase II':
      return [left, right];
    case 'anaphase II':
    case 'telophase II':
      return [sisters(left, 0), sisters(left, 1), sisters(right, 0), sisters(right, 1)];
  }
  return [];
}
