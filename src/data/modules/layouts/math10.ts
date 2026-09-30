/**
 * Grade 10 math layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../math/10.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

// ── Constructions (G-CO.1, G-CO.12, G-CO.13) ──
const CONSTRUCTIONS: LayoutDef[] = [
  {
    kind: 'sequence',
    id: 'm.10.constructions~bisector-steps',
    title: 'Construct a perpendicular bisector',
    use: 'Use this for “What is the next step in constructing the perpendicular bisector of AB?”',
    assumptions: [
      'Only a compass and a straightedge: no ruler marks and no protractor.',
      'Every point where the arcs cross is the same distance from A and from B.',
      'The line through two such points is the perpendicular bisector.',
    ],
    question: 'Put the steps in order, first step first.',
    stages: [
      { label: 'Open the compass to more than half of AB' },
      { label: 'Draw an arc from A across the segment' },
      { label: 'Keep the same opening and draw an arc from B' },
      { label: 'Mark where the two arcs cross, above and below' },
      { label: 'Draw the line through the two crossings' },
    ],
  },
  {
    kind: 'sequence',
    id: 'm.10.constructions~angle-bisector-steps',
    title: 'Bisect an angle',
    use: 'Use this for “Put the steps for bisecting ∠AOB with a compass in order.”',
    assumptions: [
      'The first arc makes OA = OB; the two equal arcs from A and B make AP = BP.',
      'So △AOP ≅ △BOP by SSS, and ray OP splits the angle into two equal halves.',
    ],
    question: 'Put the steps in order, first step first.',
    stages: [
      { label: 'Draw an arc from O that crosses both sides, at A and B' },
      { label: 'From A, draw an arc inside the angle' },
      { label: 'With the same opening, draw an arc from B that crosses it at P' },
      { label: 'Draw ray OP' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.10.constructions~angle-bisector-facts',
    title: 'What the angle bisector construction guarantees',
    use: 'Use this for “After bisecting ∠AOB with a compass, which statements must be true?”',
    assumptions: [
      'The first arc from O cuts the sides at A and B; the equal arcs from A and B cross at P.',
      'Only what the equal compass openings make equal is guaranteed.',
    ],
    question: 'Is the statement always true after the construction?',
    bins: [
      {
        id: 'always',
        label: 'Always true',
        why: 'The compass openings make it so, whatever the angle.',
      },
      {
        id: 'not',
        label: 'Not always true',
        why: 'It depends on the angle or on how wide the compass was opened.',
      },
    ],
    cards: [
      { label: 'OA = OB', bin: 'always' },
      { label: 'AP = BP', bin: 'always' },
      { label: 'm∠AOP = m∠BOP', bin: 'always' },
      { label: '△AOP ≅ △BOP', bin: 'always' },
      { label: 'AB = BP', bin: 'not' },
      { label: 'OB = BP', bin: 'not' },
      { label: 'OP = AB', bin: 'not' },
      { label: '∠AOB is a right angle', bin: 'not' },
    ],
  },
  {
    kind: 'sequence',
    id: 'm.10.constructions~find-center',
    title: 'Find the center of a circle',
    use: 'Use this for “How can you find the center of a circle with a compass and straightedge?”',
    assumptions: [
      'The perpendicular bisector of any chord passes through the center.',
      'Two bisectors that aren’t parallel cross at exactly one point: the center.',
    ],
    question: 'Put the steps in order, first step first.',
    stages: [
      { label: 'Draw two chords that aren’t parallel' },
      { label: 'Construct the perpendicular bisector of each chord' },
      { label: 'Mark where the two bisectors cross: the center' },
      { label: 'Check: the center is the same distance from every point on the circle' },
    ],
  },
];

// ── Reasoning and proof (G-CO.9, G-CO.10) ──
const PROOFS: LayoutDef[] = [
  {
    kind: 'sequence',
    id: 'm.10.proofs',
    assumptions: [
      'Each line of a proof is a statement and its reason: a given, a definition, a postulate or a theorem proved before.',
      'A line can only use lines above it.',
      'Linear pairs are two angles that make a straight line: they add to 180°.',
    ],
    question: 'Put the proof that vertical angles are congruent in order.',
    stages: [
      { label: 'Lines ℓ and m cross, making ∠1, ∠2 and ∠3 in a row (Given)' },
      {
        label: 'm∠1 + m∠2 = 180° and m∠2 + m∠3 = 180° (Linear pairs are supplementary)',
      },
      { label: 'm∠1 + m∠2 = m∠2 + m∠3 (Substitution)' },
      { label: 'm∠1 = m∠3 (Subtraction Property of Equality)' },
      { label: '∠1 ≅ ∠3 (Definition of congruent angles)' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.10.proofs~conditional',
    title: 'Conditional, converse, inverse, contrapositive',
    use: 'Use this for “Write the converse of ‘If two angles are vertical, then they are congruent.’ Is it true?”',
    assumptions: [
      'Converse: swap the if and the then. Inverse: say “not” to both. Contrapositive: do both.',
      'A statement and its contrapositive are true together; so are the converse and the inverse.',
      'One counterexample is enough to show a statement is false.',
    ],
    question: 'Is the statement always true, or does it have a counterexample?',
    bins: [
      { id: 'true', label: 'Always true', why: 'No example breaks it.' },
      {
        id: 'false',
        label: 'Has a counterexample',
        why: 'An example meets the if part but not the then part.',
      },
    ],
    cards: [
      { label: 'If two angles are vertical, then they are congruent', bin: 'true' },
      { label: 'If two angles are congruent, then they are vertical', bin: 'false' },
      { label: 'If two angles are not vertical, then they are not congruent', bin: 'false' },
      { label: 'If two angles are not congruent, then they are not vertical', bin: 'true' },
      { label: 'If a figure is a square, then it has four right angles', bin: 'true' },
      { label: 'If a figure has four right angles, then it is a square', bin: 'false' },
      {
        label: 'If a figure is not a square, then it doesn’t have four right angles',
        bin: 'false',
      },
      {
        label: 'If a figure doesn’t have four right angles, then it is not a square',
        bin: 'true',
      },
    ],
  },
  {
    kind: 'sequence',
    id: 'm.10.proofs~algebraic-proof',
    title: 'Reasons in an algebraic proof',
    use: 'Use this for “Solve 2(x − 3) = 14 and give a reason for each step.”',
    assumptions: [
      'Each step of solving an equation is a property of equality or of numbers.',
      'Doing the same to both sides keeps them equal.',
    ],
    question: 'Put the steps of the proof in order.',
    stages: [
      { label: '2(x − 3) = 14 (Given)' },
      { label: '2x − 6 = 14 (Distributive Property)' },
      { label: '2x = 20 (Addition Property of Equality)' },
      { label: 'x = 10 (Division Property of Equality)' },
    ],
  },
];

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

export const MATH_10_LAYOUTS: LayoutDef[] = [...CONSTRUCTIONS, ...PROOFS, ...SIMILARITY, ...VOLUME];
