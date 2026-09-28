/**
 * Round-4 gallery demos (group D; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily. Each demo is a page its picture is drawn for (its own
 * variables, relations and picture), with the page's example or one at the edge of its range.
 */
import type { Values } from '@/engine/types';

import type { LayoutDef } from './layouts';
import { MATH_2_MODULES } from './math/2';
import { MATH_3_MODULES } from './math/3';
import { MATH_6_MODULES } from './math/6';
import type { ModuleDef } from './types';

const PAGES = [...MATH_2_MODULES, ...MATH_3_MODULES, ...MATH_6_MODULES];

/** The page `pageId` as a gallery demo `id`, with its own picture unless `extra` changes it. */
function demo(
  pageId: string,
  id: string,
  title: string,
  extra: Partial<ModuleDef> & { example?: Values } = {},
): ModuleDef {
  const page = PAGES.find((m) => m.id === pageId);
  if (!page) throw new Error(`galleryR4d: no page ${pageId}`);
  return { ...page, id, title, ...extra };
}

export const R4D_GALLERY_MODULES: ModuleDef[] = [
  // Q07: the array, counters in a tray and squares on a grid, braces for rows and columns.
  demo('m.2.arrays', 'g.r4d-array', 'Array: 3 rows of 4'),
  demo('m.2.arrays', 'g.r4d-array-5x5', 'Array: 5 rows of 5', { example: { r: 5, c: 5, n: 25 } }),
  demo('m.3.multiply-divide-100~array', 'g.r4d-array-10x10', 'Array: 10 rows of 10', {
    example: { r: 10, c: 10, n: 100 },
  }),
  demo('m.3.multiply-divide-100~array', 'g.r4d-array-1x10', 'Array: 1 row of 10', {
    example: { r: 1, c: 10, n: 10 },
  }),
  demo('m.2.thirds-polygons~rows-columns', 'g.r4d-array-squares', 'Array of squares: 6 by 6', {
    example: { r: 6, c: 6, n: 36 },
  }),
  demo('m.3.multiplication-properties~order', 'g.r4d-array-turned-10', 'Turned array: 9 × 10', {
    example: { a: 9, b: 10, n: 90 },
  }),
  demo('m.3.area~split', 'g.r4d-array-split-edge', 'Split rectangle: 10 × 10', {
    example: { a: 10, l: 10, b: 9, c: 1, A: 100, p: 90, q: 10 },
  }),
  // Q12: dividing fractions, one number line with the dividend bar and the groups on it.
  demo('m.6.divide-fractions~how-many-fit', 'g.r4d-fit', 'How many groups: 9/4 ÷ 3/4'),
  demo('m.6.divide-fractions~how-many-fit', 'g.r4d-fit-part', 'How many groups: 5/2 ÷ 3/4', {
    example: { a: 5, b: 2, c: 3, d: 4, m: 4, g: 10 / 3 },
  }),
  demo('m.6.divide-fractions', 'g.r4d-fit-less', 'Less than a group: 2/3 ÷ 3/4'),
  demo('m.6.divide-fractions~how-many-fit', 'g.r4d-fit-many', 'How many groups: 11/2 ÷ 1/4', {
    example: { a: 11, b: 2, c: 1, d: 4, m: 4, g: 22 },
  }),
  demo('m.6.divide-fractions~how-many-fit', 'g.r4d-fit-tiny', 'How many groups: 12 ÷ 1/12', {
    example: { a: 12, b: 1, c: 1, d: 12, m: 12, g: 144 },
  }),
  demo(
    'm.6.divide-fractions~how-much-in-one',
    'g.r4d-fit-share',
    'How much fills the whole: 2/3 ÷ 3/4',
  ),
  demo(
    'm.6.divide-fractions~how-much-in-one',
    'g.r4d-fit-share-past',
    'Past the whole: 5/6 ÷ 5/4',
    {
      example: { a: 5, b: 6, c: 5, d: 4, e: 20, f: 30 },
    },
  ),
];
export const R4D_GALLERY_LAYOUTS: LayoutDef[] = [];
