/**
 * Who a sampling method picks from a population drawn as a grid, and how an experiment splits
 * its sample: shared by the `studyDesign` figure, the sampling card icons and the harness. The
 * random picks come from a fixed seed, so every screen shows the same sample.
 */
import { seeded } from '../reps/statMath';

import type { SamplingMethod } from '@/data/modules/typesHsb';

export type { SamplingMethod };

/** A population of cols × rows people, numbered in reading order. */
export interface Grid {
  cols: number;
  rows: number;
}

/** The `studyDesign` figure's population: 48 people in 8 columns and 6 rows. */
export const STUDY_GRID: Grid = { cols: 8, rows: 6 };

/** k distinct numbers from `from`, picked by chance (seeded), in increasing order. */
function pick(from: number[], k: number, rand: () => number): number[] {
  const pool = [...from];
  const out: number[] = [];
  while (out.length < k && pool.length)
    out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]!);
  return out.sort((a, b) => a - b);
}

/** The strata: bands of rows (3 bands). */
export const strataOf = (g: Grid) => {
  const per = Math.max(1, Math.round(g.rows / 3));
  return [0, 1, 2].map((b) =>
    Array.from({ length: g.cols * per }, (_, i) => b * per * g.cols + i).filter(
      (i) => i < g.cols * g.rows,
    ),
  );
};

/** The clusters: the grid cut into 4 blocks (left and right halves, top and bottom). */
export const clustersOf = (g: Grid) => {
  const hc = Math.ceil(g.cols / 2);
  const hr = Math.ceil(g.rows / 2);
  const out: number[][] = [[], [], [], []];
  for (let r = 0; r < g.rows; r++)
    for (let c = 0; c < g.cols; c++) out[(r < hr ? 0 : 2) + (c < hc ? 0 : 1)]!.push(r * g.cols + c);
  return out;
};

/**
 * The people a method picks, `size` of them (a cluster sample takes whole clusters, so its size
 * is a cluster's): simple random by chance from everyone; stratified by chance from each band;
 * cluster, whole blocks by chance; systematic, every kth from a chance start; convenience, the
 * first ones in reach (reading order from the top left).
 */
export function sampleOf(method: SamplingMethod, g: Grid, size: number, seed = 4): number[] {
  const n = g.cols * g.rows;
  const all = Array.from({ length: n }, (_, i) => i);
  const rand = seeded(seed);
  const k = Math.max(1, Math.min(n, Math.round(size)));
  switch (method) {
    case 'simple random':
      return pick(all, k, rand);
    case 'stratified': {
      const strata = strataOf(g);
      const each = Math.max(1, Math.round(k / strata.length));
      return strata.flatMap((s) => pick(s, each, rand)).sort((a, b) => a - b);
    }
    case 'cluster': {
      const clusters = clustersOf(g);
      const count = Math.max(1, Math.min(clusters.length, Math.round(k / clusters[0]!.length)));
      return pick([0, 1, 2, 3], count, rand)
        .flatMap((i) => clusters[i]!)
        .sort((a, b) => a - b);
    }
    case 'systematic': {
      const step = Math.max(1, Math.floor(n / k));
      const start = Math.floor(rand() * step);
      return all.filter((i) => i >= start && (i - start) % step === 0).slice(0, k);
    }
    case 'convenience':
      return all.slice(0, k);
  }
}

/** An experiment's random assignment: the sample shuffled (seeded) and split in two halves. */
export function assignOf(sample: number[], seed = 11): [number[], number[]] {
  const rand = seeded(seed);
  const pool = [...sample];
  const shuffled: number[] = [];
  while (pool.length) shuffled.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]!);
  const half = Math.ceil(shuffled.length / 2);
  const up = (xs: number[]) => xs.sort((a, b) => a - b);
  return [up(shuffled.slice(0, half)), up(shuffled.slice(half))];
}
