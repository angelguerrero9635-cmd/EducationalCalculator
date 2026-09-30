/**
 * Facts the group HL earth and space figures draw, shared with their harness checks
 * (harness/layoutFiguresHsl.ts).
 */

/**
 * The Mohs scale: each mineral's rank and its absolute hardness on a sclerometer scale that sets
 * talc at 1 (the commonly quoted values: the ranks are equal steps, the hardness is not).
 */
export const MOHS: { rank: number; name: string; absolute: number }[] = [
  { rank: 1, name: 'Talc', absolute: 1 },
  { rank: 2, name: 'Gypsum', absolute: 3 },
  { rank: 3, name: 'Calcite', absolute: 9 },
  { rank: 4, name: 'Fluorite', absolute: 21 },
  { rank: 5, name: 'Apatite', absolute: 48 },
  { rank: 6, name: 'Orthoclase', absolute: 72 },
  { rank: 7, name: 'Quartz', absolute: 100 },
  { rank: 8, name: 'Topaz', absolute: 200 },
  { rank: 9, name: 'Corundum', absolute: 400 },
  { rank: 10, name: 'Diamond', absolute: 1500 },
];

/** Everyday scratch tests and their hardness. */
export const MOHS_TOOLS: { name: string; hardness: number }[] = [
  { name: 'fingernail', hardness: 2.5 },
  { name: 'copper coin', hardness: 3.5 },
  { name: 'glass', hardness: 5.5 },
  { name: 'steel file', hardness: 6.5 },
];
