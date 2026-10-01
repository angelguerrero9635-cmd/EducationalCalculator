/**
 * Grades 9–12 round 4 gallery demos (H111–H114; see pictureRequestsHs.ts and docs/HS_NEEDS.md
 * P23–P26). Each demo is the page that waits, with the option it will pass. Spread into
 * gallery.ts.
 */
import type { LayoutDef } from './layouts';
import { SCIENCE_9_LAYOUTS } from './layouts/science9';
import type { ModuleDef } from './types';

export const HS4_GALLERY_MODULES: ModuleDef[] = [];

// ── H114 (P26): the germ-layer bins in the gastrula card's colors ──

const GERM_COLORS = { ecto: 'bioAmino', meso: 'organDeep', endo: 'bioSugar' } as const;

const germLayers: LayoutDef = (() => {
  const page = SCIENCE_9_LAYOUTS.find((l) => l.id === 's.9.reproduction-development~germ-layers');
  if (!page || page.kind !== 'sort') throw new Error('galleryHs4: no germ-layers sort');
  return {
    ...page,
    id: 'g.s9-reproduction-development-germ-layers-colors',
    title: 'Germ layers in the gastrula’s colors',
    bins: page.bins.map((b) => ({
      ...b,
      color: GERM_COLORS[b.id as keyof typeof GERM_COLORS],
    })),
  };
})();

export const HS4_GALLERY_LAYOUTS: LayoutDef[] = [germLayers];
