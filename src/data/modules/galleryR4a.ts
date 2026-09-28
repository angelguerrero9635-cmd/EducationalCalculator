/**
 * Round-4 gallery demos (group A; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily. Each demo is the page it was drawn for (its variables,
 * relations and picture), once with the page's own example and once at the edge of its range.
 */
import type { Values } from '@/engine/types';

import { getLayout, type ExploreLayout, type LayoutDef } from './layouts';
import { MATH_2_MODULES } from './math/2';
import type { ModuleDef } from './types';

const PAGES = [...MATH_2_MODULES];

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
