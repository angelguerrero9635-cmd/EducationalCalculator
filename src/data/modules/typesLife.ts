/**
 * Picture specs for Grade 7 life science (energy through an ecosystem, natural selection),
 * kept apart from `types.ts` so that file's union only lists them. A `number | string` field
 * is a fixed number or a variable id.
 */
import type { NumOrVar } from './typesGraphs';

/**
 * An energy pyramid: one flat tier per feeding level, producers at the bottom, each tier as
 * wide as its energy (to scale, so the top tiers are slivers). `levels` are the energies,
 * bottom first (2 to 5); `percent` is the share passed up each step (10 by default), marked
 * beside each step. `names` name the levels (producers, first consumers, …). Drag the
 * bottom tier's edge to change the producers' energy.
 */
export interface EnergyPyramidSpec {
  kind: 'energyPyramid';
  levels: string[];
  percent?: NumOrVar;
  names?: string[];
}

/** Beetle colors for `generations` (each drawn in its own shell color). */
export type BeetleColor = 'green' | 'brown' | 'black' | 'yellow' | 'red';

/**
 * A population over generations: one stacked bar per generation, a segment per variety
 * (beetles of each color), counts written in the segments, the share of variety `follow`
 * (0 first, drawn at the bottom) over each bar. `counts[g][k]` is generation g's count of
 * variety k (2 to 8 generations, 2 or 3 varieties). A painted beetle of each color keys the
 * bars. Drag the first generation's split to change its count of the followed variety.
 */
export interface GenerationsSpec {
  kind: 'generations';
  /** Per generation, the count of each variety; with `total`, of the first variety only. */
  counts: string[][];
  /** The population size: each generation's last variety is drawn as `total` less the rest. */
  total?: string;
  colors?: BeetleColor[];
  /** Names of the varieties ("green beetles"); `<color> beetles` by default. */
  names?: string[];
  follow?: number;
  /** What one generation is called on the axis ("Generation" by default). */
  label?: string;
}

/** The variable ids a spec above names (for the module tests). */
export function lifeSpecVars(r: EnergyPyramidSpec | GenerationsSpec): string[] {
  switch (r.kind) {
    case 'energyPyramid':
      return [...r.levels, ...(typeof r.percent === 'string' ? [r.percent] : [])];
    case 'generations':
      return [...r.counts.flat(), ...(r.total ? [r.total] : [])];
  }
}
