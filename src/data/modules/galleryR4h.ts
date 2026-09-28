/**
 * Round-4 gallery demos (group H; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily.
 */
import type { Values } from '@/engine/types';

import type { LayoutDef } from './layouts';
import { SCIENCE_3_MODULES } from './science/3';
import { SCIENCE_6_MODULES } from './science/6';
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
  // Q40: s.6.cells~cell-size, the page's example, a 100-cell row at low power and two cells.
  copy(SCIENCE_6_MODULES, 's.6.cells~cell-size', 'g.r4h-field', 'Field of view (page example)'),
  copy(SCIENCE_6_MODULES, 's.6.cells~cell-size', 'g.r4h-field-many', 'Field of view (100 cells)', {
    f: 4500,
    n: 100,
    s: 45,
  }),
  copy(SCIENCE_6_MODULES, 's.6.cells~cell-size', 'g.r4h-field-two', 'Field of view (two cells)', {
    f: 450,
    n: 2,
    s: 225,
  }),
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
  // Q33: s.5.particles-matter, the mixed and squeezed scenes first, and a mixed solid.
  {
    kind: 'explore',
    id: 'g.r4h-particles',
    assumptions: ['Tap a scene to see how the particles are arranged.'],
    figure: { kind: 'particles' },
    scenes: [
      {
        label: 'Sugar in water',
        particles: { state: 'liquid', mixed: true },
        lines: ['The sugar particles spread among the water particles.'],
      },
      {
        label: 'Squeezed air',
        particles: { state: 'gas', squeezed: true },
        lines: ['The same particles in less room.'],
      },
      {
        label: 'Gas',
        particles: { state: 'gas' },
        lines: ['The particles are far apart and fly about.'],
      },
      {
        label: 'Sugar in ice',
        particles: { state: 'solid', mixed: true },
        lines: ['Sugar particles frozen in among the water particles.'],
      },
    ],
  },
];
