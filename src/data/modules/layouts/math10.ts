/**
 * Grade 10 math layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../math/10.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

// ── Similarity (G-SRT.2–5) ──
const SIMILARITY: LayoutDef[] = [
  {
    kind: 'sort',
    id: 'm.10.similarity~similar-or-not',
    title: 'Similar, and by which test?',
    use: 'Use this for “Which pairs of triangles must be similar, and why?”',
    assumptions: [
      'AA: two pairs of equal angles. SSS: all three side ratios equal.',
      'SAS: two side ratios equal and the angles between those sides equal.',
      'Anything less is not enough: the triangles might not match.',
    ],
    question: 'Must the triangles be similar? By which test?',
    bins: [
      {
        id: 'aa',
        label: 'Similar by AA',
        why: 'Two pairs of equal angles fix the third pair too.',
      },
      {
        id: 'sss',
        label: 'Similar by SSS',
        why: 'Every side of one is the same multiple of its match.',
      },
      {
        id: 'sas',
        label: 'Similar by SAS',
        why: 'Two sides in the same ratio with equal angles between them.',
      },
      {
        id: 'not',
        label: 'Not always similar',
        why: 'The facts given fit triangles of different shapes.',
      },
    ],
    cards: [
      { label: 'm∠A = m∠D and m∠B = m∠E', bin: 'aa' },
      { label: 'Two equilateral triangles', bin: 'aa' },
      { label: 'Sides 3, 4, 6 and 4.5, 6, 9', bin: 'sss' },
      { label: 'AB/DE = AC/DF = 2 and m∠A = m∠D', bin: 'sas' },
      { label: 'Two isosceles triangles', bin: 'not' },
      { label: 'Two right triangles', bin: 'not' },
      { label: 'Sides 4, 6, 8 and 6, 9, 13', bin: 'not' },
      { label: 'AB/DE = BC/EF and m∠A = m∠D', bin: 'not' },
    ],
  },
];

// ── Surface area, volume and cross sections (G-GMD.4) ──
const VOLUME: LayoutDef[] = [
  {
    kind: 'sort',
    id: 'm.10.volume-derivations~cross-section-shapes',
    title: 'What shape is the cut?',
    use: 'Use this for “A plane cuts a cube through three corners. What shape is the cross section?”',
    assumptions: [
      'A cross section is the flat shape where a plane cuts a solid.',
      'Its number of sides is the number of faces the plane crosses.',
      'A curved surface cut by a plane gives a curved edge.',
    ],
    question: 'What shape is the cross section?',
    bins: [
      {
        id: 'circle',
        label: 'Circle',
        why: 'A level cut of a round solid, or any cut of a sphere.',
      },
      {
        id: 'ellipse',
        label: 'Ellipse',
        why: 'A slanted cut all the way round a cone or cylinder.',
      },
      { id: 'triangle', label: 'Triangle', why: 'The plane crosses three faces.' },
      { id: 'square', label: 'Square', why: 'A level cut of a solid with a square base.' },
      { id: 'rectangle', label: 'Rectangle', why: 'Straight down, parallel to the height.' },
      { id: 'pentagon', label: 'Pentagon', why: 'The plane crosses five faces.' },
    ],
    cards: [
      { label: 'Cylinder cut level', bin: 'circle' },
      { label: 'Sphere cut by any plane', bin: 'circle' },
      { label: 'Cone cut on a slant, missing the base', bin: 'ellipse' },
      { label: 'Cylinder cut on a slant, missing both bases', bin: 'ellipse' },
      { label: 'Cone cut straight down through its tip', bin: 'triangle' },
      { label: 'Cube cut through the three corners next to one corner', bin: 'triangle' },
      { label: 'Cube cut level', bin: 'square' },
      { label: 'Square pyramid cut level', bin: 'square' },
      { label: 'Cylinder cut straight down through its axis', bin: 'rectangle' },
      { label: 'Cube cut straight down through two opposite edges', bin: 'rectangle' },
      { label: 'Cube cut by a plane crossing five of its faces', bin: 'pentagon' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.10.volume-derivations~solids-of-revolution',
    title: 'Turn a shape: which solid?',
    use: 'Use this for “A right triangle is turned about one leg. What solid does it sweep out?”',
    assumptions: [
      'Turning a flat shape all the way round a line sweeps out a solid.',
      'The line it turns about becomes the solid’s axis.',
      'A side on the line stays put; a side parallel to it sweeps a curved surface.',
    ],
    question: 'What solid does the shape sweep out?',
    bins: [
      {
        id: 'cylinder',
        label: 'Cylinder',
        why: 'The side opposite the axis sweeps a tube of one radius.',
      },
      { id: 'cone', label: 'Cone', why: 'A slanted side meets the axis at a point: the tip.' },
      {
        id: 'sphere',
        label: 'Sphere',
        why: 'Every point of the curve is one distance from the center.',
      },
    ],
    cards: [
      { label: 'A rectangle turned about one side', bin: 'cylinder' },
      { label: 'A square turned about a side', bin: 'cylinder' },
      { label: 'A right triangle turned about a leg', bin: 'cone' },
      { label: 'An isosceles triangle turned about its line of symmetry', bin: 'cone' },
      { label: 'A semicircle turned about its diameter', bin: 'sphere' },
      { label: 'A circle turned about a diameter', bin: 'sphere' },
    ],
  },
];

export const MATH_10_LAYOUTS: LayoutDef[] = [...SIMILARITY, ...VOLUME];
