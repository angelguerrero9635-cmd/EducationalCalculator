/**
 * Round-4 gallery demos (group H; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily.
 */
import type { Values } from '@/engine/types';

import type { LayoutDef } from './layouts';
import { SCIENCE_3_MODULES } from './science/3';
import type { ModuleDef } from './types';

/** A copy of a lesson page under a gallery id, with its own example. */
const copy = (modules: ModuleDef[], page: string, id: string, title: string, example?: Values) => {
  const m = modules.find((x) => x.id === page)!;
  return { ...m, id, title, example: example ?? m.example };
};

export const R4H_GALLERY_MODULES: ModuleDef[] = [
  // Q24: s.3.adaptation-fossils~layers, the page's example and the deepest cliff (ten layers).
  copy(
    SCIENCE_3_MODULES,
    's.3.adaptation-fossils~layers',
    'g.r4h-rock',
    'Rock layers (page example)',
  ),
  copy(
    SCIENCE_3_MODULES,
    's.3.adaptation-fossils~layers',
    'g.r4h-rock-deep',
    'Rock layers (ten layers)',
    {
      f: 9,
      s: 0,
      d: 9,
    },
  ),
];

export const R4H_GALLERY_LAYOUTS: LayoutDef[] = [
  // Q21: s.6.cell-organelles, one scene per cell and a cell with no part chosen.
  {
    kind: 'explore',
    id: 'g.r4h-cell',
    assumptions: ['Choose a part to see it lit in its cell.'],
    figure: { kind: 'cell' },
    scenes: [
      {
        label: 'Mitochondria',
        cell: { type: 'animal', part: 'mitochondria' },
        lines: ['Break down sugar with oxygen to release the energy the cell uses.'],
      },
      {
        label: 'Chloroplasts',
        cell: { type: 'plant', part: 'chloroplasts' },
        lines: ['Use energy from sunlight to make sugar from water and carbon dioxide.'],
      },
      {
        label: 'Bacterium',
        cell: { type: 'bacterium', part: 'dna' },
        lines: ['It has no nucleus: its DNA lies loose in the cytoplasm.'],
      },
      {
        label: 'Plant cell',
        cell: { type: 'plant' },
        lines: ['Every part drawn, none chosen.'],
      },
    ],
  },
];
