/**
 * Round-4 gallery demos (group F; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily.
 *
 * Each demo copies a page's own module or layout, with its example or an edge of its range.
 */
import type { Values } from '@/engine/types';

import { COLLEGE_MODULES } from './college';
import type { ExploreLayout, LayoutDef } from './layouts';
import { MATH_LAYOUTS } from './layouts/math';
import { MATH_1_MODULES } from './math/1';
import { MATH_2_MODULES } from './math/2';
import { MATH_3_MODULES } from './math/3';
import { SCIENCE_1_MODULES } from './science/1';
import { SCIENCE_K_MODULES } from './science/k';
import { SCIENCE_2_MODULES } from './science/2';
import { SCIENCE_3_MODULES } from './science/3';
import { SCIENCE_4_MODULES } from './science/4';
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
  // Q27: bar charts. The Grade 2 page's example and its range's edge (20 and 0), a science
  // page with icons under the bars, four bars with icons at the top of their range, and bars
  // that can't be dragged.
  copy(MATH_2_MODULES, 'm.2.graphs-line-plots', 'g.r4f-bars', 'Bar graph'),
  copy(MATH_2_MODULES, 'm.2.graphs-line-plots', 'g.r4f-bars-edge', 'Bar graph: 20 and 0', {
    a: 20,
    b: 0,
    c: 1,
    e: 19,
    n: 40,
  }),
  copy(SCIENCE_1_MODULES, 's.1.sky-patterns', 'g.r4f-bars-icons', 'Bars with icons', undefined, {
    bars: [
      { var: 's', editable: true, icon: 'sun' },
      { var: 'w', editable: true, icon: 'snow cloud' },
    ],
  }),
  copy(
    SCIENCE_3_MODULES,
    's.3.weather-climate',
    'g.r4f-bars-rain',
    'Bars: four weeks of rain',
    { a: 40, b: 2, c: 32, d: 1, m: 75 },
    {
      bars: ['a', 'b', 'c', 'd'].map((v) => ({ var: v, editable: true, icon: 'rain cloud' })),
    },
  ),
  copy(SCIENCE_4_MODULES, 's.4.weathering', 'g.r4f-bars-fixed', 'Bars you read'),
  // Q29: one object on a yardstick and foot rulers (the page's 3 feet, and 1 foot), and on a
  // meter tape and meter sticks (the page's 3 meters, and the most, 5).
  copy(MATH_2_MODULES, 'm.2.standard-length~two-units', 'g.r4f-feet', 'Inches and feet'),
  copy(MATH_2_MODULES, 'm.2.standard-length~two-units', 'g.r4f-feet-edge', 'One foot', {
    f: 1,
    n: 12,
  }),
  copy(MATH_2_MODULES, 'm.2.standard-length~meters', 'g.r4f-meters', 'Meters'),
  copy(MATH_2_MODULES, 'm.2.standard-length~meters', 'g.r4f-meters-edge', 'Five meters', {
    m: 5,
    c: 500,
  }),
  // Q36: ribbons on a wooden ruler (the page's 12 and 8 cm, and 30 and 1 cm), a broken ruler
  // (3 to 10, and 8 to 15), quarter inches, and a 60 cm ruler.
  copy(MATH_2_MODULES, 'm.2.standard-length', 'g.r4f-ruler', 'Ribbons on a ruler'),
  copy(MATH_2_MODULES, 'm.2.standard-length', 'g.r4f-ruler-edge', 'Ribbons: 30 and 1 cm', {
    L: 30,
    S: 1,
    d: 29,
  }),
  copy(MATH_2_MODULES, 'm.2.standard-length~broken-ruler', 'g.r4f-broken', 'Broken ruler'),
  copy(
    MATH_2_MODULES,
    'm.2.standard-length~broken-ruler',
    'g.r4f-broken-edge',
    'Broken ruler: 8 to 15',
    {
      s: 8,
      L: 7,
      e: 15,
    },
  ),
  copy(MATH_3_MODULES, 'm.3.measure-line-plots~quarter-inch', 'g.r4f-quarter', 'Quarter inches'),
  copy(
    SCIENCE_2_MODULES,
    's.2.plant-growth-investigation~week',
    'g.r4f-ruler-long',
    'A 60 cm ruler',
  ),
  // Q44: the population waterfall (the topic's example, and a big gain from both sides).
  copy(COLLEGE_MODULES, 'he.geography.human-geography#0', 'g.r4f-waterfall', 'Waterfall'),
  copy(
    COLLEGE_MODULES,
    'he.geography.human-geography#0',
    'g.r4f-waterfall-edge',
    'Waterfall: big gain',
    {
      Pop: 500000,
      B: 9000,
      D: 1000,
      I: 7000,
      E: 1000,
      N: 8000,
      M: 6000,
      P: 14000,
      CBR: 18,
      CDR: 2,
      RNI: 1.6,
      Td: 43.75,
    },
  ),
  // Q49: tally tables with icons: the fruit page's example and its top row (20), the weather
  // page, and the litter page.
  copy(MATH_1_MODULES, 'm.1.data-3-categories~tally', 'g.r4f-tally', 'Tally chart', undefined, {
    icons: ['apple', 'banana', 'grapes'],
  }),
  copy(
    MATH_1_MODULES,
    'm.1.data-3-categories~tally',
    'g.r4f-tally-edge',
    'Tally chart: 20',
    { a: 20, b: 1, g: 12, n: 33 },
    { icons: ['apple', 'banana', 'grapes'] },
  ),
  copy(
    SCIENCE_K_MODULES,
    's.K.weather-patterns',
    'g.r4f-tally-weather',
    'Tally: sunny days',
    undefined,
    {
      icons: ['sun', 'rain cloud'],
    },
  ),
  copy(
    SCIENCE_K_MODULES,
    's.K.living-things-change-environment~litter',
    'g.r4f-tally-litter',
    'Tally: litter',
    undefined,
    { icons: ['soda can', 'wrapper falling on grass'] },
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
