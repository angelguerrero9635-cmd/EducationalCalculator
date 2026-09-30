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

// ── Parallel and perpendicular lines (G-CO.9, G-GPE.5) ──
const PARALLEL_LINES: LayoutDef[] = [
  {
    kind: 'sequence',
    id: 'm.10.parallel-lines~triangle-sum-proof',
    title: 'Why a triangle’s angles add to 180°',
    use: 'Use this for “Prove that the angles of a triangle add to 180°.”',
    assumptions: [
      'Through a point not on a line there is exactly one parallel line (the Parallel Postulate).',
      'Parallel lines make alternate interior angles congruent.',
      'Angles that make a straight line add to 180°.',
    ],
    question: 'Put the proof in order.',
    stages: [
      { label: 'Draw line ℓ through B parallel to AC (Parallel Postulate)' },
      { label: '∠1 ≅ ∠A and ∠3 ≅ ∠C (Alternate interior angles)' },
      {
        label:
          'm∠A + m∠B + m∠C = m∠1 + m∠B + m∠3 = 180° (Substitution; ∠1, ∠B and ∠3 make a straight angle)',
      },
    ],
  },
];

// ── Rigid motions (G-CO.2–6) ──
const RIGID_MOTIONS: LayoutDef[] = [
  {
    kind: 'sort',
    id: 'm.10.rigid-motions~which-motion',
    title: 'Which motion is the rule?',
    use: 'Use this for “Is (x, y) → (2x, 2y) a rigid motion? Which move is (x, y) → (−y, x)?”',
    assumptions: [
      'A rigid motion keeps every length and every angle.',
      'Adding to x or y slides; changing a sign or swapping flips; −y, x or −x, −y turns.',
      'Multiplying a coordinate by a number other than 1 or −1 stretches: not rigid.',
    ],
    question: 'Which motion does the rule make?',
    bins: [
      { id: 'translate', label: 'Translation', why: 'Every point slides the same way.' },
      { id: 'reflect', label: 'Reflection', why: 'Every point flips across a line.' },
      { id: 'rotate', label: 'Rotation', why: 'Every point turns about the origin.' },
      { id: 'not', label: 'Not rigid', why: 'Lengths change, so the image isn’t congruent.' },
    ],
    cards: [
      { label: '(x, y) → (x + 4, y − 1)', bin: 'translate' },
      { label: '(x, y) → (x − 2, y)', bin: 'translate' },
      { label: '(x, y) → (x, −y)', bin: 'reflect' },
      { label: '(x, y) → (y, x)', bin: 'reflect' },
      { label: '(x, y) → (−y, x)', bin: 'rotate' },
      { label: '(x, y) → (−x, −y)', bin: 'rotate' },
      { label: '(x, y) → (2x, 2y)', bin: 'not' },
      { label: '(x, y) → (x, 3y)', bin: 'not' },
    ],
  },
];

// ── Congruent triangles (G-CO.7, G-CO.8, G-SRT.5) ──
const CONGRUENCE: LayoutDef[] = [
  {
    kind: 'sort',
    id: 'm.10.congruence',
    assumptions: [
      'SSS, SAS, ASA and AAS each prove two triangles congruent; HL does for right triangles.',
      'In SAS and ASA the angle or side is between the other two parts.',
      'SSA and AAA don’t prove congruence: two different triangles can match those parts.',
    ],
    question: 'Which test proves △ABC ≅ △DEF?',
    bins: [
      { id: 'sss', label: 'SSS', why: 'Three pairs of sides are congruent.' },
      { id: 'sas', label: 'SAS', why: 'Two sides and the angle between them.' },
      { id: 'asa', label: 'ASA', why: 'Two angles and the side between them.' },
      { id: 'aas', label: 'AAS', why: 'Two angles and a side not between them.' },
      { id: 'hl', label: 'HL', why: 'Right triangles with the hypotenuse and a leg congruent.' },
      { id: 'none', label: 'Not enough', why: 'Two different triangles fit these parts.' },
    ],
    cards: [
      { label: 'AB = DE, BC = EF, CA = FD', bin: 'sss' },
      { label: 'AB = DE, m∠B = m∠E, BC = EF', bin: 'sas' },
      { label: 'm∠A = m∠D, AB = DE, m∠B = m∠E', bin: 'asa' },
      { label: 'm∠A = m∠D, m∠B = m∠E, BC = EF', bin: 'aas' },
      { label: 'Right angles at C and F, AB = DE, AC = DF', bin: 'hl' },
      { label: 'AB = DE, BC = EF, m∠A = m∠D', bin: 'none' },
      { label: 'All three angles equal', bin: 'none' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.10.congruence~correspondence',
    title: '△ABC ≅ △KLM: must it be true?',
    use: 'Use this for “△ABC ≅ △KLM. Which parts must be congruent?”',
    assumptions: [
      'The order of the letters pairs the parts: A with K, B with L, C with M.',
      'A side pairs with the side whose letters sit in the same places: BC with LM.',
    ],
    question: 'Must the statement be true?',
    bins: [
      { id: 'must', label: 'Must be true', why: 'The letters sit in matching places.' },
      { id: 'not', label: 'Not always', why: 'The letters don’t match in order.' },
    ],
    cards: [
      { label: '∠B ≅ ∠L', bin: 'must' },
      { label: 'AC ≅ KM', bin: 'must' },
      { label: 'AB ≅ KL', bin: 'must' },
      { label: '∠C ≅ ∠M', bin: 'must' },
      { label: 'BC ≅ KL', bin: 'not' },
      { label: '∠A ≅ ∠M', bin: 'not' },
      { label: 'AB ≅ LM', bin: 'not' },
      { label: '∠B ≅ ∠K', bin: 'not' },
    ],
  },
  {
    kind: 'sequence',
    id: 'm.10.congruence~cpctc-proof',
    title: 'Prove two segments congruent',
    use: 'Use this for “M is the midpoint of PQ and of RS. Prove PR ≅ QS.”',
    assumptions: [
      'Given: M is the midpoint of PQ and of RS. Prove: PR ≅ QS.',
      'Prove two triangles congruent first; then their corresponding parts are congruent.',
    ],
    question: 'Put the proof in order.',
    stages: [
      { label: 'PM ≅ QM and RM ≅ SM (M is the midpoint of both: given)' },
      { label: '∠PMR ≅ ∠QMS (Vertical angles)' },
      { label: '△PMR ≅ △QMS (SAS)' },
      { label: 'PR ≅ QS (Corresponding parts of congruent triangles)' },
    ],
  },
];

// ── Relationships within triangles (G-CO.10, G-C.3) ──
const TRIANGLE_RELATIONSHIPS: LayoutDef[] = [
  {
    kind: 'sort',
    id: 'm.10.triangle-relationships~which-center',
    title: 'Which center?',
    use: 'Use this for “Which point of a triangle is the same distance from all three sides?”',
    assumptions: [
      'Each center is where three special lines of the triangle meet.',
      'Medians give the centroid, angle bisectors the incenter, perpendicular bisectors the circumcenter, altitudes the orthocenter.',
    ],
    question: 'Which center is it?',
    bins: [
      { id: 'centroid', label: 'Centroid', why: 'Where the medians meet: the balance point.' },
      { id: 'incenter', label: 'Incenter', why: 'Where the angle bisectors meet.' },
      { id: 'circumcenter', label: 'Circumcenter', why: 'Where the perpendicular bisectors meet.' },
      { id: 'orthocenter', label: 'Orthocenter', why: 'Where the altitudes meet.' },
    ],
    cards: [
      { label: 'Medians meet', bin: 'centroid' },
      { label: 'Cuts each median 2:1 from the corner', bin: 'centroid' },
      { label: 'Balance point', bin: 'centroid' },
      { label: 'Angle bisectors meet', bin: 'incenter' },
      { label: 'Same distance from all three sides', bin: 'incenter' },
      { label: 'Center of the circle inside touching each side', bin: 'incenter' },
      { label: 'Perpendicular bisectors meet', bin: 'circumcenter' },
      { label: 'Same distance from all three corners', bin: 'circumcenter' },
      { label: 'Center of the circle through the corners', bin: 'circumcenter' },
      { label: 'Altitudes meet', bin: 'orthocenter' },
    ],
  },
];

// ── Quadrilaterals (G-CO.11) ──
const QUADRILATERALS: LayoutDef[] = [
  {
    kind: 'sort',
    id: 'm.10.quadrilaterals~name-it',
    title: 'Name it exactly',
    use: 'Use this for “A parallelogram has perpendicular diagonals. What is the most exact name for it?”',
    assumptions: [
      'Give the most exact name: a square is also a rectangle and a rhombus, but “square” says more.',
      'A rectangle is a parallelogram with a right angle; a rhombus is one with four equal sides.',
    ],
    question: 'What is the most exact name?',
    bins: [
      {
        id: 'parallelogram',
        label: 'Parallelogram',
        why: 'Both pairs of opposite sides parallel, nothing more.',
      },
      { id: 'rectangle', label: 'Rectangle', why: 'A parallelogram with right angles.' },
      { id: 'rhombus', label: 'Rhombus', why: 'A parallelogram with four equal sides.' },
      { id: 'square', label: 'Square', why: 'Both a rectangle and a rhombus.' },
      { id: 'trapezoid', label: 'Trapezoid', why: 'Exactly one pair of parallel sides.' },
      { id: 'kite', label: 'Kite', why: 'Two pairs of equal sides next to each other.' },
    ],
    cards: [
      { label: 'Both pairs of opposite sides parallel', bin: 'parallelogram' },
      { label: 'A parallelogram with a right angle', bin: 'rectangle' },
      { label: 'A parallelogram with equal diagonals', bin: 'rectangle' },
      { label: 'A parallelogram with perpendicular diagonals', bin: 'rhombus' },
      { label: 'A parallelogram whose diagonals bisect its angles', bin: 'rhombus' },
      { label: 'A rectangle with two equal adjacent sides', bin: 'square' },
      { label: 'A rhombus with a right angle', bin: 'square' },
      { label: 'Exactly one pair of parallel sides', bin: 'trapezoid' },
      { label: 'Two pairs of equal adjacent sides, not all four equal', bin: 'kite' },
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

export const MATH_10_LAYOUTS: LayoutDef[] = [
  ...CONSTRUCTIONS,
  ...PROOFS,
  ...PARALLEL_LINES,
  ...RIGID_MOTIONS,
  ...CONGRUENCE,
  ...TRIANGLE_RELATIONSHIPS,
  ...QUADRILATERALS,
  ...SIMILARITY,
  ...VOLUME,
];
