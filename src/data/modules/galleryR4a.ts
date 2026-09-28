/**
 * Round-4 gallery demos (group A; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily. Each demo is the page it was drawn for (its variables,
 * relations and picture), once with the page's own example and once at the edge of its range.
 */
import type { Values } from '@/engine/types';

import { getLayout, type ExploreLayout, type LayoutDef } from './layouts';
import { MATH_1_MODULES } from './math/1';
import { MATH_2_MODULES } from './math/2';
import { MATH_K_MODULES } from './math/k';
import { SCIENCE_K_MODULES } from './science/k';
import type { ModuleDef } from './types';

const PAGES = [...MATH_K_MODULES, ...MATH_1_MODULES, ...MATH_2_MODULES, ...SCIENCE_K_MODULES];

/** The page `pageId` as a gallery demo `id` (with its own example unless one is given). */
function demo(
  pageId: string,
  id: string,
  title: string,
  extra: Partial<ModuleDef> & { example?: Values } = {},
): ModuleDef {
  const page = PAGES.find((m) => m.id === pageId);
  if (!page) throw new Error(`galleryR4a: no page ${pageId}`);
  return { ...page, id, title, ...extra };
}

export const R4A_GALLERY_MODULES: ModuleDef[] = [
  // Q01: real coins at true sizes, with running totals.
  demo('m.2.money~one-coin', 'g.r4a-coins', 'Coins: 3 dimes'),
  demo('m.2.money~one-coin', 'g.r4a-coins-ten-quarters', 'Coins: 10 quarters', {
    example: { v: 25, k: 10, T: 250 },
  }),
  demo('m.2.money~one-coin', 'g.r4a-coins-pennies', 'Coins: 7 pennies', {
    example: { v: 1, k: 7, T: 7 },
  }),
  // Q08: counting strips with match lines and a bracket over the extras.
  demo('m.K.compare-10', 'g.r4a-compare', 'Compare rows: 7 and 4'),
  demo('m.K.compare-10', 'g.r4a-compare-ten-none', 'Compare rows: 10 and 0', {
    example: { a: 10, b: 0, d: 10 },
  }),
  demo('m.K.compare-10~numerals', 'g.r4a-compare-numerals', 'Compare rows: 6 and 9'),
  demo('m.K.measurable-attributes', 'g.r4a-pencils', 'Compare rows: two pencils'),
  demo('m.K.measurable-attributes', 'g.r4a-pencils-long', 'Compare rows: 12 cubes and 1 cube', {
    example: { a: 12, b: 1, d: 11 },
  }),
  demo('m.K.measurable-attributes~capacity', 'g.r4a-jars', 'Compare rows: cups of water'),
  demo('m.K.measurable-attributes~capacity', 'g.r4a-jars-same', 'Compare rows: 10 cups each', {
    example: { a: 10, b: 10, d: 0 },
  }),
  demo('m.1.add-sub-20~compare', 'g.r4a-compare-cubes', 'Compare rows: 11 and 7 cubes'),
  demo('m.1.add-sub-20~compare', 'g.r4a-compare-cubes-20', 'Compare rows: 20 and 3 cubes', {
    example: { B: 20, S: 3, d: 17 },
  }),
  demo('m.1.measure-nonstandard', 'g.r4a-pencil-crayon', 'Compare rows: pencil and crayon', {
    representation: {
      kind: 'compareRows',
      a: 'a',
      b: 'b',
      difference: 'd',
      icon: 'cube',
      words: ['longer', 'shorter'],
      object: ['pencil', 'crayon'],
    },
  }),
  demo('m.1.measure-nonstandard', 'g.r4a-pencil-crayon-20', 'Compare rows: 19 and 20 cubes', {
    example: { a: 19, b: 20, d: 1 },
    representation: {
      kind: 'compareRows',
      a: 'a',
      b: 'b',
      difference: 'd',
      icon: 'cube',
      words: ['longer', 'shorter'],
      object: ['pencil', 'crayon'],
    },
  }),
  // Q14: snap-cube trains on one left edge, the part added first on a band with its sum.
  demo('m.1.addition-properties', 'g.r4a-trains', 'Cube trains: 3 + 8 + 2'),
  demo('m.1.addition-properties', 'g.r4a-trains-20', 'Cube trains: 10 + 9 + 1', {
    example: { a: 10, b: 9, c: 1, s: 20 },
  }),
  demo('m.1.addition-properties', 'g.r4a-trains-zero', 'Cube trains: 0 + 1 + 9', {
    example: { a: 0, b: 1, c: 9, s: 10 },
  }),
  // Q25: large counters on a felt mat, numbered as they are tapped.
  demo('m.K.count-objects', 'g.r4a-dots', 'Counters on a mat: 7'),
  demo('m.K.count-objects', 'g.r4a-dots-19', 'Counters on a mat: 19', {
    example: { n: 19, m: 20 },
  }),
  // Q26: matte pattern blocks filling a dashed hexagon slot, a tray with counts.
  demo('m.K.compose-shapes', 'g.r4a-blocks', 'Pattern blocks: one of each'),
  demo('m.K.compose-shapes', 'g.r4a-blocks-triangles', 'Pattern blocks: 6 triangles', {
    example: { z: 0, r: 0, t: 6 },
  }),
  demo('m.K.compose-shapes', 'g.r4a-blocks-trapezoids', 'Pattern blocks: 2 trapezoids', {
    example: { z: 2, r: 0, t: 0 },
  }),
  // Q41: pairs in two-cell trays, the one left over in a half-empty tray.
  demo('m.2.even-odd', 'g.r4a-pairs', 'Pairs: 7'),
  demo('m.2.even-odd', 'g.r4a-pairs-20', 'Pairs: 20', { example: { n: 20, p: 10, r: 0 } }),
  demo('m.2.even-odd', 'g.r4a-pairs-19', 'Pairs: 19', { example: { n: 19, p: 9, r: 1 } }),
  // Q48: a firmer number bond with ten-frame counters in each circle.
  demo('m.K.add-sub-10~number-bond', 'g.r4a-bond', 'Number bond: 7 is 4 and 3'),
  demo('m.K.add-sub-10~number-bond', 'g.r4a-bond-10', 'Number bond: 10 is 10 and 0', {
    example: { w: 10, a: 10, b: 0 },
  }),
  demo('s.K.living-needs', 'g.r4a-seeds', 'Compare rows: seeds that sprouted'),
  demo('s.K.living-needs', 'g.r4a-seeds-all', 'Compare rows: 10 and 0 seeds', {
    example: { w: 10, d: 0, m: 10 },
  }),
];
/** The explore page `pageId` as a gallery demo, its scenes starting at `first`. */
function explore(pageId: string, id: string, title: string, first = 0): LayoutDef[] {
  const l = getLayout(pageId);
  if (!l || l.kind !== 'explore') return [];
  const own = l as ExploreLayout;
  const scenes = [...own.scenes.slice(first), ...own.scenes.slice(0, first)];
  return [{ ...own, id, title, scenes, use: undefined }];
}

export const R4A_GALLERY_LAYOUTS: LayoutDef[] = [
  // Q03: a cardboard box on a table, a rubber ball and a child as the viewer.
  ...explore('m.K.position-words', 'g.r4a-position', 'Position words: above the box'),
  ...explore('m.K.position-words', 'g.r4a-position-behind', 'Position words: behind the box', 5),
];
