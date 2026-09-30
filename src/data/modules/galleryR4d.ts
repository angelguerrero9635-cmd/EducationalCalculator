/**
 * Round-4 gallery demos (group D; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily. Each demo is a page its picture is drawn for (its own
 * variables, relations and picture), with the page's example or one at the edge of its range.
 */
import type { Values } from '@/engine/types';

import type { LayoutDef } from './layouts';
import { MATH_LAYOUTS } from './layouts/math';
import { MATH_1_MODULES } from './math/1';
import { MATH_2_MODULES } from './math/2';
import { MATH_3_MODULES } from './math/3';
import { MATH_4_MODULES } from './math/4';
import { MATH_5_MODULES } from './math/5';
import { MATH_6_MODULES } from './math/6';
import { MATH_9_MODULES } from './math/9';
import { SCIENCE_6_MODULES } from './science/6';
import type { ModuleDef } from './types';

const PAGES = [
  ...MATH_1_MODULES,
  ...MATH_2_MODULES,
  ...MATH_3_MODULES,
  ...MATH_4_MODULES,
  ...MATH_5_MODULES,
  ...MATH_6_MODULES,
  ...SCIENCE_6_MODULES,
  ...MATH_9_MODULES,
];

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
  // Q28: hops, one arc per ten (or hundred) plus the rest, adding solid and taking away dashed.
  demo('m.1.add-within-100~subtract-tens', 'g.r4d-hops-tens', 'Hops: 70 take away 3 tens'),
  demo('m.1.add-within-100~subtract-tens', 'g.r4d-hops-tens-edge', 'Hops: 90 take away 8 tens', {
    example: { a: 90, b: 80, c: 10 },
  }),
  demo(
    'm.2.add-sub-100-fluency~two-step',
    'g.r4d-hops-two-step',
    'Hops: 25 + 18, then take away 9',
  ),
  demo(
    'm.2.add-sub-100-fluency~two-step',
    'g.r4d-hops-two-step-edge',
    'Hops: 5 + 95, then take away 100',
    {
      example: { s: 5, a: 95, m: 100, b: 100, e: 0 },
    },
  ),
  demo('m.2.add-sub-100-fluency~add-add', 'g.r4d-hops-add-add', 'Hops: add twice'),
  demo('m.3.two-step-problems~add-subtract', 'g.r4d-hops-hundreds', 'Hops: 184 + 80 − 100'),
  demo('m.3.two-step-problems~add-subtract', 'g.r4d-hops-hundreds-edge', 'Hops: 450 + 380 − 760', {
    example: { a: 450, b: 380, t: 830, c: 760, l: 70 },
  }),
  // Q32: two heavy lines, paired ticks joined, the current pair in pills.
  demo('m.6.unit-rates', 'g.r4d-dnl', 'Double number line: 6 items for $7.50'),
  demo('m.6.unit-rates', 'g.r4d-dnl-many', 'Double number line: 11 items for $13.75', {
    example: { n: 11, t: 13.75, c: 1.25 },
  }),
  demo('m.6.unit-rates', 'g.r4d-dnl-whole', 'Double number line: whole dollars', {
    example: { n: 4, t: 12, c: 3 },
  }),
  demo('m.5.powers-of-ten~metric', 'g.r4d-dnl-metric', 'Double number line: 2.5 × 100'),
  demo('m.5.powers-of-ten~metric', 'g.r4d-dnl-metric-edge', 'Double number line: 15 × 1,000', {
    example: { k: 1000, a: 15, c: 15000 },
  }),
  demo('s.6.rock-cycle~layer-time', 'g.r4d-dnl-layer', 'Double number line: 30 cm of ooze'),
  // Q43: the elapsed-time line, 5-minute ticks, jumps with chips, counting back from the end.
  demo('m.3.elapsed-time~elapsed', 'g.r4d-time', 'Elapsed time: 3:45 and 35 minutes'),
  demo('m.3.elapsed-time~elapsed', 'g.r4d-time-long', 'Elapsed time: 600 minutes', {
    example: { sh: 11, sm: 55, d: 600, eh: 9, em: 55 },
  }),
  demo('m.3.elapsed-time~elapsed', 'g.r4d-time-short', 'Elapsed time: 12 minutes past the hour', {
    example: { sh: 2, sm: 50, d: 12, eh: 3, em: 2 },
  }),
  demo('m.3.elapsed-time~start-time', 'g.r4d-time-back', 'Start time: back 35 minutes from 4:20'),
  demo(
    'm.3.elapsed-time~start-time',
    'g.r4d-time-back-short',
    'Start time: back 7 minutes from 12:05',
    {
      example: { sh: 11, sm: 58, d: 7, eh: 12, em: 5 },
    },
  ),
  // Q46: centred headers, a light selected row and the pattern between rows.
  demo('m.4.unit-conversion', 'g.r4d-table', 'Table: feet and inches'),
  demo('m.6.expressions-variables~exponents', 'g.r4d-table-powers', 'Table: powers of a base'),
  demo('s.6.body-systems~heart-output', 'g.r4d-table-heart', 'Table: seven heart rates'),
  demo('m.9.exponential-functions~decay', 'g.r4d-table-growth', 'Table: eleven rows of decay'),
  demo('s.6.cells~magnification', 'g.r4d-table-no-pattern', 'Table: no single pattern'),
];

/** The explore page `id` as a gallery demo, its scenes changed by `scene`. */
function layoutDemo(
  pageId: string,
  id: string,
  title: string,
  scene: (s: Scene) => Scene,
  first?: string,
): LayoutDef {
  const page = MATH_LAYOUTS.find((l) => l.id === pageId);
  if (!page || page.kind !== 'explore') throw new Error(`galleryR4d: no explore page ${pageId}`);
  // The scene labelled `first` opens the demo (so a screenshot shows it).
  const scenes = page.scenes.map(scene);
  const at = Math.max(
    0,
    scenes.findIndex((s) => s.label === first),
  );
  return { ...page, id, title, scenes: [...scenes.slice(at), ...scenes.slice(0, at)] };
}
type Scene = Extract<LayoutDef, { kind: 'explore' }>['scenes'][number];
const withPair = (s: Scene): Scene =>
  s.table?.mirror ? { ...s, table: { ...s.table, pair: [4, 7] } } : s;

export const R4D_GALLERY_LAYOUTS: LayoutDef[] = [
  // Q47: the times table with room to read, hops on a counting row, a turn-around pair.
  layoutDemo('m.3.arithmetic-patterns', 'g.r4d-times-table', 'Times table patterns', withPair),
  layoutDemo(
    'm.3.arithmetic-patterns',
    'g.r4d-times-table-turn',
    'Times table: turn-around facts',
    withPair,
    'Turn-around facts',
  ),
  layoutDemo(
    'm.3.arithmetic-patterns',
    'g.r4d-times-table-doubles',
    'Times table: doubles',
    withPair,
    'Doubles',
  ),
];
