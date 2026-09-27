/**
 * Round-3 gallery demos (group I; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily. Each demo is the page it was drawn for, with the new
 * option on its picture: the page's own variables, relations and example.
 */
import type { Values } from '@/engine/types';

import { iconSort } from './galleryIconSort';
import type { LayoutDef } from './layouts';
import { MATH_1_MODULES } from './math/1';
import { MATH_2_MODULES } from './math/2';
import { MATH_3_MODULES } from './math/3';
import { MATH_5_MODULES } from './math/5';
import { MATH_6_MODULES } from './math/6';
import { MATH_K_MODULES } from './math/k';
import { SCIENCE_2_MODULES } from './science/2';
import { SCIENCE_5_MODULES } from './science/5';
import type { ModuleDef, Representation } from './types';

const PAGES = [
  ...MATH_K_MODULES,
  ...MATH_1_MODULES,
  ...MATH_2_MODULES,
  ...MATH_3_MODULES,
  ...MATH_5_MODULES,
  ...MATH_6_MODULES,
  ...SCIENCE_2_MODULES,
  ...SCIENCE_5_MODULES,
];

/** The page `pageId` as a gallery demo `id`, drawn with `representation` (and `example`). */
function demo(
  pageId: string,
  id: string,
  title: string,
  representation: Representation,
  extra: Partial<ModuleDef> & { example?: Values } = {},
): ModuleDef {
  const page = PAGES.find((m) => m.id === pageId);
  if (!page) throw new Error(`galleryR3i: no page ${pageId}`);
  return { ...page, id, title, representation, ...extra };
}

export const R3I_GALLERY_MODULES: ModuleDef[] = [
  // D65: take-away counters crossed out, not open.
  demo('m.K.add-sub-10~take-away', 'g.ten-frame-take-away', 'Ten-frame: take away', {
    kind: 'tenFrame',
    first: 'l',
    second: 't',
    total: 's',
    takeAway: true,
  }),
  demo(
    'm.K.add-sub-10~take-away',
    'g.ten-frame-take-away-all',
    'Ten-frame: take them all away',
    { kind: 'tenFrame', first: 'l', second: 't', total: 's', takeAway: true },
    { example: { s: 10, t: 10, l: 0 } },
  ),
  // D66: the full ten broken, b counters crossed out inside it.
  demo('m.1.add-sub-20~take-from-ten', 'g.ten-frame-take-from-ten', 'Ten-frame: take from ten', {
    kind: 'tenFrame',
    first: 10,
    second: 'o',
    total: 'c',
    frames: 2,
    crossOut: 'b',
  }),
  demo(
    'm.1.add-sub-20~take-from-ten',
    'g.ten-frame-take-from-ten-edge',
    'Ten-frame: take 9 from 19',
    { kind: 'tenFrame', first: 10, second: 'o', total: 'c', frames: 2, crossOut: 'b' },
    { example: { c: 19, b: 9, o: 9, r: 1, a: 10 } },
  ),
  // D68: base-ten blocks after the trades, the blocks taken away crossed out.
  demo('m.2.add-sub-1000~subtract', 'g.base-ten-take-away', 'Base-ten blocks: take away', {
    kind: 'baseTen',
    groups: ['a'],
    takeAway: 'b',
    controls: [
      { var: 'a', steps: [1, 10, 100] },
      { var: 'b', steps: [1, 10, 100] },
    ],
  }),
  demo(
    'm.2.add-sub-1000~subtract',
    'g.base-ten-take-away-1000',
    'Base-ten blocks: 1,000 take away',
    {
      kind: 'baseTen',
      groups: ['a'],
      takeAway: 'b',
      controls: [
        { var: 'a', steps: [1, 10, 100] },
        { var: 'b', steps: [1, 10, 100] },
      ],
    },
    { example: { a: 1000, b: 999, c: 1 } },
  ),
  // D70: the fruit graph drawn in its fruit.
  demo('m.1.data-3-categories', 'g.picture-graph-fruit', 'Picture graph: fruit', {
    kind: 'pictureGraph',
    columns: [
      { var: 'c', icon: 'apple' },
      { var: 's', icon: 'banana' },
      { var: 't', icon: 'grapes' },
    ],
    max: 20,
    total: 'n',
  }),
  // D71: the pond animals drawn as themselves.
  demo('s.2.habitats~pond-count', 'g.picture-graph-pond', 'Picture graph: pond animals', {
    kind: 'pictureGraph',
    columns: [
      { var: 'f', icon: 'frog' },
      { var: 'h', icon: 'fish' },
      { var: 'i', icon: 'grasshopper' },
    ],
    max: 10,
    total: 'n',
  }),
  // D86: one picture for every column, half pictures in the key.
  demo('m.3.scaled-graphs~picture-graph', 'g.picture-graph-half', 'Picture graph: half pictures', {
    kind: 'pictureGraph',
    columns: [
      { var: 'p1', icon: 'circle' },
      { var: 'p2', icon: 'circle' },
      { var: 'p3', icon: 'circle' },
    ],
    max: 10,
    key: 'k',
    half: true,
  }),
  demo(
    'm.3.scaled-graphs~picture-graph',
    'g.picture-graph-half-10',
    'Picture graph: half pictures of 10',
    {
      kind: 'pictureGraph',
      columns: [
        { var: 'p1', icon: 'circle' },
        { var: 'p2', icon: 'circle' },
        { var: 'p3', icon: 'circle' },
      ],
      max: 10,
      key: 'k',
      half: true,
    },
    { example: { k: 10, p1: 9.5, p2: 0.5, p3: 4, n1: 95, n2: 5, n3: 40 } },
  ),
  // D81: each number on its own rounding line, the estimate of the sum under them.
  demo('m.3.rounding~estimate', 'g.rounding-two-sum', 'Rounding: estimate a sum', {
    kind: 'rounding',
    value: 'a',
    rounded: 'x',
    to: 10,
    second: { value: 'b', rounded: 'y', estimate: 'e' },
  }),
  demo(
    'm.3.rounding~estimate',
    'g.rounding-two-sum-edge',
    'Rounding: estimate 495 + 5',
    {
      kind: 'rounding',
      value: 'a',
      rounded: 'x',
      to: 10,
      second: { value: 'b', rounded: 'y', estimate: 'e' },
    },
    { example: { a: 495, b: 5, x: 500, y: 10, e: 510, s: 500, o: 10 } },
  ),
  // D82: the same two lines for a difference.
  demo(
    'm.3.rounding~estimate-difference',
    'g.rounding-two-difference',
    'Rounding: estimate a difference',
    {
      kind: 'rounding',
      value: 'a',
      rounded: 'x',
      to: 10,
      second: { value: 'b', rounded: 'y', estimate: 'e', minus: true },
    },
  ),
  // D85: every side labeled with the one length, the perimeter under the shape.
  demo('m.3.perimeter~equal-sides', 'g.polygon-equal-sides', 'Polygon: equal sides', {
    kind: 'polygon',
    sides: 'n',
    side: 's',
    around: 'P',
  }),
  demo(
    'm.3.perimeter~equal-sides',
    'g.polygon-equal-sides-8',
    'Polygon: a stop sign',
    { kind: 'polygon', sides: 'n', side: 's', around: 'P' },
    { example: { n: 8, s: 20, P: 160 } },
  ),
  // D92: three ratio bars, the total bracketed beside them.
  demo('m.6.ratios~three-parts', 'g.ratio-tape-three-parts', 'Ratio tape: three parts', {
    kind: 'tape',
    ratio: ['a', 'b', 'c'],
    unit: 'u',
    amounts: ['x', 'y', 'z'],
    total: 't',
  }),
  demo(
    'm.6.ratios~three-parts',
    'g.ratio-tape-three-edge',
    'Ratio tape: a long first part',
    { kind: 'tape', ratio: ['a', 'b', 'c'], unit: 'u', amounts: ['x', 'y', 'z'], total: 't' },
    {
      example: { a: 12, b: 1, c: 7, n: 20, u: 10000, x: 120000, y: 10000, z: 70000, t: 200000 },
    },
  ),
  // D93: tenths columns times tenths rows, the overlap the product in hundredths.
  demo('m.5.decimal-operations~times-decimal', 'g.grid-product', 'Hundred grid: tenths × tenths', {
    kind: 'grid100',
    percent: 'p',
    product: ['a', 'b'],
  }),
  demo(
    'm.5.decimal-operations~times-decimal',
    'g.grid-product-9',
    'Hundred grid: 0.9 × 0.9',
    { kind: 'grid100', percent: 'p', product: ['a', 'b'] },
    { example: { a: 0.9, b: 0.9, p: 0.81 } },
  ),
  demo(
    'm.5.decimal-operations~times-decimal',
    'g.grid-product-area',
    'Hundred grid: 1.4 × 0.3 (area model)',
    { kind: 'grid100', percent: 'p', product: ['a', 'b'] },
    { example: { a: 1.4, b: 0.3, p: 0.42 } },
  ),
  // D94: two decimals stacked by place, the sum under a rule.
  demo(
    'm.6.multi-digit-decimals~add-subtract',
    'g.place-value-sum',
    'Place-value chart: adding decimals',
    { kind: 'placeValueChart', value: 'a', plus: 'b', total: 's', decimals: 3 },
  ),
  demo(
    'm.6.multi-digit-decimals~add-subtract',
    'g.place-value-sum-edge',
    'Place-value chart: the biggest sum',
    { kind: 'placeValueChart', value: 'a', plus: 'b', total: 's', decimals: 3 },
    { example: { a: 9999.999, b: 9999.999, s: 19999.998 } },
  ),
  // D96: the same scale before and after the fizz, the escaped gas labelled.
  demo('s.5.conservation-mass~fizz', 'g.scale-before-after', 'Scale: before and after', {
    kind: 'scale',
    items: ['d', 'v', 'c'],
    total: 'A',
    before: 'B',
    max: 500,
  }),
  demo(
    's.5.conservation-mass~fizz',
    'g.scale-before-after-edge',
    'Scale: 10 g of gas',
    { kind: 'scale', items: ['d', 'v', 'c'], total: 'A', before: 'B', max: 500 },
    { example: { d: 20, v: 300, c: 100, B: 420, A: 410, g: 10 } },
  ),
  // D97: washers hanging from a spring scale, read in newtons.
  demo('s.5.gravity-down~spring-scale', 'g.spring-scale', 'Spring scale: washers', {
    kind: 'scale',
    count: 'n',
    each: 'e',
    total: 'p',
    max: 10,
    hanging: true,
  }),
  demo(
    's.5.gravity-down~spring-scale',
    'g.spring-scale-20',
    'Spring scale: 20 washers',
    { kind: 'scale', count: 'n', each: 'e', total: 'p', max: 10, hanging: true },
    { example: { n: 20, e: 2, p: 40 } },
  ),
];
// D70: the fruit icons at card size.
export const R3I_GALLERY_LAYOUTS: LayoutDef[] = [
  iconSort('g.fruit-icons', 'Fruit icons', 'Which fruit grow in a bunch?', [
    ['bunch', 'In a bunch', 'Many fruit hang from one stem.', ['grapes', 'banana']],
    ['one', 'One at a time', 'Each fruit hangs on its own stem.', ['apple']],
  ]),
];
