/**
 * Round-4 gallery demos (group C; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily.
 *
 * Each demo is the lesson page itself (its figure and every scene), plus scenes at the edge of
 * what the figure takes, so the gallery shows the page's own examples and the extremes.
 */
import type { ExploreLayout, LayoutDef, Scene } from './layouts';
import { SCIENCE_LAYOUTS } from './layouts/science';
import type { ModuleDef } from './types';

export const R4C_GALLERY_MODULES: ModuleDef[] = [];

/** An explore page's demo: the page's scenes, then `extra` ones, under a gallery id. */
function demo(page: string, id: string, title: string, extra: Scene[]): ExploreLayout {
  const found = SCIENCE_LAYOUTS.find((l) => l.id === page);
  if (!found || found.kind !== 'explore') throw new Error(`${page} is not an explore page`);
  return { ...found, id, title, use: undefined, scenes: [...found.scenes, ...extra] };
}

export const R4C_GALLERY_LAYOUTS: LayoutDef[] = [
  // Q06: s.6.water-cycle
  demo('s.6.water-cycle', 'g.r4c-water-cycle', 'Water cycle landscape', [
    {
      label: 'Runoff, no driver named',
      water: { process: 'runoff' },
      lines: ['With no driver given, the figure shows no driver chip.'],
    },
  ]),
  // Q15: s.6.body-systems
  demo('s.6.body-systems', 'g.r4c-body-systems', 'Body systems silhouette', [
    {
      label: 'No system lit',
      body: { systems: [] },
      lines: ['Every system ghosted.'],
    },
    {
      label: 'Every system lit',
      body: {
        systems: [
          'circulatory',
          'respiratory',
          'digestive',
          'nervous',
          'muscular',
          'skeletal',
          'excretory',
        ],
      },
      lines: ['All seven systems at once, each with its chip.'],
    },
  ]),
  // Q16: s.6.plate-tectonics~pangaea
  demo('s.6.plate-tectonics~pangaea', 'g.r4c-continents', 'Continents over time', [
    {
      label: 'Shape clue, 250 million years ago',
      continents: { age: 250, clue: 'shapes' },
      lines: ['The coasts lit where they touch.'],
    },
    {
      label: 'Fossil clue today',
      continents: { age: 0, clue: 'fossils' },
      lines: ['The fossil band stretched across the ocean.'],
    },
    {
      label: 'Rock clue, 150 million years ago',
      continents: { age: 150, clue: 'rocks' },
      lines: ['The mountain belt as the Atlantic opens.'],
    },
    {
      label: 'Climate clue today',
      continents: { age: 0, clue: 'climate' },
      lines: ['The scratches point every which way today.'],
    },
  ]),
];
