/**
 * Round-4 gallery demos (group E; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily.
 *
 * Each demo is a copy of one of the entry's pages (same variables, relations and picture), with
 * the page's own example or one at the edge of its range, so the redraw is seen on /gallery.
 */
import type { LayoutDef } from './layouts';
import { MATH_2_MODULES } from './math/2';
import { MATH_3_MODULES } from './math/3';
import { MATH_4_MODULES } from './math/4';
import { MATH_5_MODULES } from './math/5';
import { MATH_6_MODULES } from './math/6';
import { SCIENCE_6_MODULES } from './science/6';
import type { ModuleDef, Representation } from './types';

const PAGES = [
  ...MATH_2_MODULES,
  ...MATH_3_MODULES,
  ...MATH_4_MODULES,
  ...MATH_5_MODULES,
  ...MATH_6_MODULES,
  ...SCIENCE_6_MODULES,
];

/** A copy of page `from` as demo `id`, with another example or picture options. */
function demo(
  from: string,
  id: string,
  title: string,
  example?: ModuleDef['example'],
  picture?: Partial<Representation>,
): ModuleDef[] {
  const page = PAGES.find((m) => m.id === from);
  // A page renamed by the lesson chat drops its demo rather than breaking the gallery.
  if (!page) return [];
  return [
    {
      ...page,
      id,
      title,
      example: example ?? page.example,
      // Spread as plain objects: the union of every picture spec is too large to spread.
      representation: {
        ...(page.representation as object),
        ...(picture as object),
      } as Representation,
    },
  ];
}

export const R4E_GALLERY_MODULES: ModuleDef[] = [
  // Q31 baseHeight: the page's parallelogram, a tall thin triangle, a trapezoid with a longer
  // top, and a wide flat house.
  ...demo('m.6.area-polygons', 'g.r4e-parallelogram', 'Parallelogram cut and moved'),
  ...demo('m.6.area-polygons~triangle', 'g.r4e-triangle-tall', 'Tall thin triangle', {
    b: 3,
    h: 7,
    A: 10.5,
  }),
  ...demo('m.6.area-polygons~trapezoid', 'g.r4e-trapezoid', 'Trapezoid, longer top', {
    a: 16,
    c: 19,
    h: 18,
    A: 315,
  }),
  ...demo('m.6.area-polygons~composite', 'g.r4e-house-wide', 'Wide flat house', {
    w: 20,
    H: 2,
    r: 1,
    R: 40,
    T: 10,
    S: 50,
  }),
  // Q34 factorTree: the page's 24 and 36; 60 and 90 share three primes (three ring colours);
  // 64 and 96 are the deepest trees in the page's range (seven and six levels).
  ...demo('m.6.gcf-lcm~factor-tree', 'g.r4e-factor-trees', 'Factor trees, shared primes'),
  ...demo('m.6.gcf-lcm~factor-tree', 'g.r4e-factor-trees-three', 'Three shared primes', {
    a: 60,
    b: 90,
    g: 30,
    l: 180,
  }),
  ...demo('m.6.gcf-lcm~factor-tree', 'g.r4e-factor-trees-deep', 'Deepest factor trees', {
    a: 64,
    b: 96,
    g: 32,
    l: 192,
  }),
  // Q35 rectangle: the page's 6 by 4 with its perimeter and squares; the largest grid of the
  // area page (12 by 10); a thin perimeter-only strip; the biggest square of Grade 4; and the
  // roof option on the roof-rain page's example and on a small square roof.
  ...demo('m.3.perimeter~same-area', 'g.r4e-rect-same-area', 'Squares and perimeter'),
  ...demo('m.3.area', 'g.r4e-rect-area-max', 'Largest area grid', { l: 12, w: 10, A: 120 }),
  ...demo('m.3.perimeter', 'g.r4e-rect-perimeter-strip', 'Thin perimeter strip', {
    l: 9,
    w: 1,
    P: 20,
  }),
  ...demo('m.4.area-perimeter-formulas~square', 'g.r4e-rect-square-big', 'Biggest square', {
    s: 100,
    P: 400,
    A: 10000,
  }),
  ...demo('s.6.water-cycle~roof-rain', 'g.r4e-roof', 'Rain on a roof', undefined, {
    roof: true,
  }),
  ...demo(
    's.6.water-cycle~roof-rain',
    'g.r4e-roof-small',
    'Rain on a small roof',
    { l: 4, w: 4, A: 16, r: 25, W: 400 },
    { roof: true },
  ),
  // Q37 venn: the page's 12 and 18; 72 and 96 (the most shared factors in range, 8); 97 and
  // 100 (only 1 shared, the badge alone in the overlap).
  ...demo('m.6.gcf-lcm', 'g.r4e-venn', 'Factors of two numbers'),
  ...demo('m.6.gcf-lcm', 'g.r4e-venn-many', 'Many shared factors', { a: 72, b: 96, g: 24 }),
  ...demo('m.6.gcf-lcm', 'g.r4e-venn-one', 'Only 1 shared', { a: 97, b: 100, g: 1 }),
  // Q42 prism: the page's cube with the counting buttons; a triangular prism and a hexagonal
  // prism (the ends of the page's range, 3 and 6 sides), also counting.
  ...demo(
    'm.2.thirds-polygons~solids',
    'g.r4e-prism-count',
    'Count faces, edges, corners',
    undefined,
    {
      counting: true,
    },
  ),
  ...demo(
    'm.2.thirds-polygons~solids',
    'g.r4e-prism-triangle',
    'Triangular prism',
    { s: 3, F: 5, E: 9, V: 6 },
    { counting: true },
  ),
  ...demo(
    'm.2.thirds-polygons~solids',
    'g.r4e-prism-hexagon',
    'Hexagonal prism',
    { s: 6, F: 8, E: 18, V: 12 },
    { counting: true },
  ),
  // Q45 areaModel: the page's 43 × 26; the biggest product of the Grade 5 page (four columns
  // and two rows); the Grade 6 decimals page's 2.35 × 1.4; the biggest division of Grade 5
  // (four partial quotients and a remainder); and a Grade 6 distributive model (letters' parts).
  ...demo('m.4.multi-digit-multiply~two-digit', 'g.r4e-area-two-digit', 'Area model, 43 × 26'),
  ...demo('m.5.standard-algorithm', 'g.r4e-area-big', 'Biggest area model', {
    a: 99999,
    b: 99,
    p: 9899901,
  }),
  ...demo('m.6.multi-digit-decimals~multiply-decimals', 'g.r4e-area-decimals', 'Decimals'),
  ...demo('m.5.divide-2-digit', 'g.r4e-area-divide', 'Division, four places', {
    n: 99999,
    d: 10,
    q: 9999,
    r: 9,
    m: 99990,
  }),
  ...demo('m.6.gcf-lcm~distributive', 'g.r4e-area-distributive', 'Distributive model'),
  // Q52 rectilinear: the page's L (3 by 5 and 4 by 2); the widest step in range (10 by 10 and
  // 10 by 1); the cut-out page's 6 by 5 less 2 by 3; and its thinnest L (10 by 10 less 9 by 9).
  ...demo('m.3.area~rectilinear', 'g.r4e-rectilinear', 'Two parts, side by side'),
  ...demo('m.3.area~rectilinear', 'g.r4e-rectilinear-wide', 'Widest step', {
    a: 10,
    b: 10,
    c: 10,
    d: 1,
    p: 100,
    q: 10,
    A: 110,
  }),
  ...demo('m.3.area~cut-out', 'g.r4e-cut-out', 'A corner cut out'),
  ...demo('m.3.area~cut-out', 'g.r4e-cut-out-thin', 'Thinnest L', {
    x: 10,
    y: 10,
    u: 9,
    z: 9,
    p: 1,
    q: 1,
    A: 19,
  }),
];
export const R4E_GALLERY_LAYOUTS: LayoutDef[] = [];
