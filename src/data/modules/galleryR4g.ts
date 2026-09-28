/**
 * Round-4 gallery demos (group G; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily. Each demo is a page its picture was drawn for, with the
 * page's own variables, relations and example, or an example at the edge of its range.
 */
import type { Values } from '@/engine/types';

import { COLLEGE_MODULES } from './college';
import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';

const PAGES = [...COLLEGE_MODULES];

/** The page `pageId` as a gallery demo `id` (with another `example`, if given). */
function demo(
  pageId: string,
  id: string,
  title: string,
  extra: Partial<ModuleDef> & { example?: Values } = {},
): ModuleDef {
  const page = PAGES.find((m) => m.id === pageId);
  if (!page) throw new Error(`galleryR4g: no page ${pageId}`);
  return { ...page, id, title, ...extra };
}

export const R4G_GALLERY_MODULES: ModuleDef[] = [
  // Q20: the series circuit as a copper-wire schematic with value chips and a current arrow.
  demo('he.engineering.circuits-1#0', 'g.series-circuit', 'Series circuit'),
  demo('he.engineering.circuits-1#0', 'g.series-circuit-big', 'Series circuit: kilohms', {
    example: { V: 240, R1: 1000, R2: 2000, Rt: 3000, I: 0.08, V1: 80, V2: 160, P: 19.2 },
  }),
];
export const R4G_GALLERY_LAYOUTS: LayoutDef[] = [];
