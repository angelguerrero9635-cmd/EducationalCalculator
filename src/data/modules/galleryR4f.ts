/**
 * Round-4 gallery demos (group F; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily.
 *
 * Each demo copies a page's own module or layout, with its example or an edge of its range.
 */
import type { Values } from '@/engine/types';

import type { ExploreLayout, LayoutDef } from './layouts';
import { MATH_LAYOUTS } from './layouts/math';
import { MATH_2_MODULES } from './math/2';
import { MATH_3_MODULES } from './math/3';
import { SCIENCE_5_MODULES } from './science/5';
import type { ModuleDef } from './types';

/**
 * A page's module under a gallery id, with its example or another one, and the picture options
 * the page is asked to add (see the tracker notes).
 */
function copy(
  from: ModuleDef[],
  id: string,
  as: string,
  title: string,
  example?: Values,
  options?: Record<string, unknown>,
): ModuleDef {
  const page = from.find((m) => m.id === id);
  if (!page) throw new Error(`galleryR4f: no page ${id}`);
  return {
    ...page,
    id: as,
    title,
    example: example ?? page.example,
    representation: { ...page.representation, ...options } as ModuleDef['representation'],
  };
}

/** Q13: the water page's pie with meaningful colors and fresh water pulled out. */
const WATER = {
  colors: ['waterDeep', 'ice', 'freshWater'],
  group: { id: 'f', parts: ['i', 'l'] },
};

const explore = (id: string) => MATH_LAYOUTS.find((l) => l.id === id) as ExploreLayout;

export const R4F_GALLERY_MODULES: ModuleDef[] = [
  // Q50: the clock, on the five-minute page's example (4:25) and near the end of the hour.
  copy(MATH_2_MODULES, 'm.2.time-5-min', 'g.r4f-clock', 'Clock: 4:25'),
  copy(MATH_3_MODULES, 'm.3.elapsed-time', 'g.r4f-clock-edge', 'Clock: near the hour', {
    h: 12,
    m: 58,
    k: 11,
    e: 3,
  }),
  // Q13: the water pie on the page's example (1,000 liters) and the smallest whole (100).
  copy(
    SCIENCE_5_MODULES,
    's.5.earth-spheres~water-share',
    'g.r4f-water-pie',
    'Water pie',
    undefined,
    WATER,
  ),
  copy(
    SCIENCE_5_MODULES,
    's.5.earth-spheres~water-share',
    'g.r4f-water-pie-edge',
    'Water pie: 100 liters',
    { w: 100, s: 97, f: 3, i: 2, l: 1 },
    WATER,
  ),
];

export const R4F_GALLERY_LAYOUTS: LayoutDef[] = [
  // Q09: the Grade 1 explore clock, with its own scenes and one at the end of the half hours.
  {
    ...explore('m.1.time-half-hour'),
    id: 'g.r4f-clock-explore',
    title: 'Explore clock',
    scenes: [
      ...explore('m.1.time-half-hour').scenes,
      {
        label: 'Half past 11',
        time: [11, 30],
        lines: ['The long hand points to 6.', 'The short hand is halfway between 11 and 12.'],
      },
    ],
  },
];
