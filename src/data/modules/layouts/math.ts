/**
 * Math K–3 pages that are sorts, sequences or explorations rather than calculators (the
 * lesson reviewer's layout proposals, docs/REVIEW_LOG.md).
 */
import type { LayoutDef } from './types';

export const MATH_LAYOUTS: LayoutDef[] = [
  // ── Kindergarten ──
  {
    kind: 'sequence',
    id: 'm.K.add-sub-10~all-partners',
    title: 'All the ways to make 5',
    use: 'Use this to list every pair that makes 5, in order.',
    assumptions: [
      'A number can be split into two parts in more than one way.',
      'Go in order. The first part goes up by 1. The second goes down by 1.',
      'Tap the pairs in order, starting with 0 + 5.',
    ],
    question: 'Put the ways to make 5 in order.',
    stages: [
      { label: '0 + 5' },
      { label: '1 + 4' },
      { label: '2 + 3' },
      { label: '3 + 2' },
      { label: '4 + 1' },
      { label: '5 + 0' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.K.classify-count~sort',
    title: 'Sort the shapes',
    use: 'Use this to sort shape cards into groups and count each group.',
    assumptions: [
      'Put each shape in one group.',
      'Count each group. The group with the most is the biggest.',
      'Tap a card, then tap its group.',
    ],
    question: 'What shape is it?',
    bins: [
      { id: 'circle', label: 'Circles', why: 'A circle is round with no corners.' },
      { id: 'square', label: 'Squares', why: 'A square has 4 equal sides and 4 corners.' },
      { id: 'triangle', label: 'Triangles', why: 'A triangle has 3 sides and 3 corners.' },
    ],
    cards: [
      { label: 'Big red circle', bin: 'circle' },
      { label: 'Small blue circle', bin: 'circle' },
      { label: 'Green circle', bin: 'circle' },
      { label: 'Yellow square', bin: 'square' },
      { label: 'Tilted square', bin: 'square' },
      { label: 'Tall triangle', bin: 'triangle' },
      { label: 'Upside-down triangle', bin: 'triangle' },
      { label: 'Small triangle', bin: 'triangle' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.K.shapes-2d-3d~solids',
    title: 'Flat or solid?',
    use: 'Use this to tell flat shapes from solid shapes.',
    assumptions: [
      'A flat shape lies on the paper. A solid shape takes up space.',
      'A ball is a sphere. A box is a cube. A can is a cylinder.',
      'Tap a card, then tap its group.',
    ],
    question: 'Is it flat or solid?',
    bins: [
      { id: 'flat', label: 'Flat', why: 'Flat shapes can be drawn on paper.' },
      { id: 'solid', label: 'Solid', why: 'Solid shapes can be held in your hand.' },
    ],
    cards: [
      { label: 'Circle', bin: 'flat' },
      { label: 'Square', bin: 'flat' },
      { label: 'Triangle', bin: 'flat' },
      { label: 'Hexagon', bin: 'flat' },
      { label: 'Sphere (a ball)', bin: 'solid' },
      { label: 'Cube (a box)', bin: 'solid' },
      { label: 'Cylinder (a can)', bin: 'solid' },
      { label: 'Cone', bin: 'solid' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.K.shapes-2d-3d~rolls',
    title: 'Does it roll or stack?',
    use: 'Use this to find which solids roll and which stack.',
    assumptions: [
      'A solid with a curved side rolls.',
      'A solid with flat sides stacks.',
      'Tap a card, then tap its group.',
    ],
    question: 'Does it roll, stack, or both?',
    bins: [
      { id: 'rolls', label: 'Rolls', why: 'Curved all round: it rolls but will not stack.' },
      { id: 'stacks', label: 'Stacks', why: 'Flat sides all round: it stacks but will not roll.' },
      { id: 'both', label: 'Rolls and stacks', why: 'Flat ends and a curved side: it does both.' },
    ],
    cards: [
      { label: 'Sphere (a ball)', bin: 'rolls' },
      { label: 'Cube (a box)', bin: 'stacks' },
      { label: 'Cylinder (a can)', bin: 'both' },
      { label: 'Cone (a party hat)', bin: 'both' },
      { label: 'Book', bin: 'stacks' },
      { label: 'Marble', bin: 'rolls' },
    ],
  },
  {
    kind: 'explore',
    id: 'm.K.position-words',
    assumptions: [
      'Position words say where a thing is.',
      'Above is higher. Below is lower. Beside is at the side.',
      'Tap a word to move the ball.',
    ],
    figure: { kind: 'position' },
    scenes: [
      { label: 'Above', position: 'above', lines: ['The ball is above the box.'] },
      { label: 'Below', position: 'below', lines: ['The ball is below the box.'] },
      {
        label: 'Beside',
        position: 'beside',
        lines: ['The ball is beside the box. It is next to it.'],
      },
      {
        label: 'In front of',
        position: 'in front of',
        lines: ['The ball is in front of the box.'],
      },
      {
        label: 'Behind',
        position: 'behind',
        lines: ['The ball is behind the box. You see only a bit of it.'],
      },
    ],
  },

  // ── Grade 1 ──
  {
    kind: 'sort',
    id: 'm.1.equal-sign~true-false',
    title: 'True or false?',
    use: 'Use this for “Is 6 + 1 = 5 + 2 true or false?”',
    assumptions: [
      'The equal sign means both sides are the same amount.',
      'Work out each side. If the amounts match, the sentence is true.',
      'Tap a card, then tap True or False.',
    ],
    question: 'Are both sides the same amount?',
    bins: [
      { id: 'true', label: 'True', why: 'Both sides make the same amount.' },
      { id: 'false', label: 'False', why: 'The two sides make different amounts.' },
    ],
    cards: [
      { label: '6 + 1 = 7', bin: 'true' },
      { label: '5 + 2 = 6 + 1', bin: 'true' },
      { label: '7 = 7', bin: 'true' },
      { label: '8 = 2 + 6', bin: 'true' },
      { label: '9 − 2 = 4 + 3', bin: 'true' },
      { label: '3 + 4 = 8', bin: 'false' },
      { label: '4 + 4 = 4 + 5', bin: 'false' },
      { label: '10 − 3 = 6', bin: 'false' },
    ],
  },
  {
    kind: 'sequence',
    id: 'm.1.measure-nonstandard~order',
    title: 'Order three ribbons',
    use: 'Use this to order three things from longest to shortest.',
    assumptions: [
      'Measure each ribbon in cubes.',
      'The ribbon with the most cubes is the longest.',
      'Tap the ribbons in order, longest first.',
    ],
    question: 'Put the ribbons in order, longest first.',
    stages: [
      { label: 'Red ribbon', span: 9 },
      { label: 'Blue ribbon', span: 6 },
      { label: 'Green ribbon', span: 4 },
    ],
    unit: 'cubes',
  },
  {
    kind: 'explore',
    id: 'm.1.time-half-hour',
    assumptions: [
      'The short hand shows the hour. The long hand shows the minutes.',
      'At o’clock the long hand points to 12. At half past it points to 6.',
      'Tap a time to set the clock.',
    ],
    figure: { kind: 'clock' },
    scenes: [
      {
        label: '3 o’clock',
        time: [3, 0],
        lines: ['The long hand points to 12.', 'The short hand points to 3.', 'It is 3:00.'],
      },
      {
        label: 'Half past 3',
        time: [3, 30],
        lines: [
          'The long hand points to 6.',
          'The short hand is halfway between 3 and 4.',
          'It is 3:30.',
        ],
      },
      {
        label: '7 o’clock',
        time: [7, 0],
        lines: ['The long hand points to 12.', 'The short hand points to 7.', 'It is 7:00.'],
      },
      {
        label: 'Half past 7',
        time: [7, 30],
        lines: [
          'The long hand points to 6.',
          'The short hand is halfway between 7 and 8.',
          'It is 7:30.',
        ],
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.1.halves-fourths~equal-parts',
    title: 'Equal parts or not?',
    use: 'Use this for “Is this shape cut into halves?”',
    assumptions: [
      'Halves are 2 equal parts. Fourths are 4 equal parts.',
      'If one part is bigger, the parts are not equal.',
      'Tap a card, then tap its group.',
    ],
    question: 'Are the parts equal?',
    bins: [
      { id: 'equal', label: 'Equal parts', why: 'Every part is the same size.' },
      { id: 'unequal', label: 'Not equal parts', why: 'One part is bigger than another.' },
    ],
    cards: [
      { label: 'Cut in 2 parts the same size', bin: 'equal' },
      { label: 'Cut in 4 parts the same size', bin: 'equal' },
      { label: 'Folded in half', bin: 'equal' },
      { label: 'Folded in half, then in half again', bin: 'equal' },
      { label: 'Cut in 2, one part bigger', bin: 'unequal' },
      { label: 'Cut in 3, all different sizes', bin: 'unequal' },
      { label: 'One big piece and one small piece', bin: 'unequal' },
    ],
  },

  // ── Grade 3 ──
  {
    kind: 'sort',
    id: 'm.3.quadrilaterals',
    assumptions: [
      'A quadrilateral is a shape with 4 straight sides.',
      'A rectangle has 4 right angles. A rhombus has 4 equal sides.',
      'A square is both: it is a rectangle and a rhombus.',
      'Tap a card, then tap its group.',
    ],
    question: 'Which does it have: 4 right angles, 4 equal sides, both, or neither?',
    bins: [
      { id: 'angles', label: '4 right angles', why: 'Rectangles have 4 square corners.' },
      { id: 'sides', label: '4 equal sides', why: 'A rhombus has 4 sides the same length.' },
      { id: 'both', label: 'Both', why: 'A square has 4 right angles and 4 equal sides.' },
      { id: 'neither', label: 'Neither', why: 'Still a quadrilateral: 4 straight sides.' },
    ],
    cards: [
      { label: 'Square', bin: 'both' },
      { label: 'Rectangle (long)', bin: 'angles' },
      { label: 'Rectangle (tall)', bin: 'angles' },
      { label: 'Rhombus (leaning)', bin: 'sides' },
      { label: 'Parallelogram', bin: 'neither' },
      { label: 'Trapezoid', bin: 'neither' },
      { label: 'Kite', bin: 'neither' },
    ],
  },

  // ── Grade 4 ──
  {
    kind: 'sort',
    id: 'm.4.lines-symmetry',
    assumptions: [
      'Parallel lines go the same way and never meet, like railroad tracks.',
      'Perpendicular lines meet at a right angle, like the corner of a page.',
      'Lines that meet at any other angle are neither.',
      'Tap a card, then tap its group.',
    ],
    question: 'Are the two lines parallel, perpendicular, or neither?',
    bins: [
      {
        id: 'parallel',
        label: 'Parallel',
        why: 'They stay the same distance apart and never meet.',
      },
      {
        id: 'perpendicular',
        label: 'Perpendicular',
        why: 'They meet at a right angle, a square corner.',
      },
      { id: 'neither', label: 'Neither', why: 'They meet, but not at a right angle.' },
    ],
    cards: [
      {
        label: 'Railroad tracks',
        bin: 'parallel',
        figure: { kind: 'lines', angle: 70, parallel: true },
      },
      {
        label: 'The two long sides of a door',
        bin: 'parallel',
        figure: { kind: 'lines', angle: 90, parallel: true },
      },
      {
        label: 'Lines on notebook paper',
        bin: 'parallel',
        figure: { kind: 'lines', angle: 0, parallel: true },
      },
      {
        label: 'The corner of a page',
        bin: 'perpendicular',
        figure: {
          kind: 'polygon',
          points: [
            [15, 95],
            [15, 15],
            [95, 15],
          ],
          open: true,
        },
      },
      { label: 'A plus sign', bin: 'perpendicular', figure: { kind: 'lines', angle: 90 } },
      {
        label: 'A wall and the floor',
        bin: 'perpendicular',
        figure: {
          kind: 'polygon',
          points: [
            [15, 5],
            [15, 95],
            [95, 95],
          ],
          open: true,
        },
      },
      { label: 'The letter X', bin: 'neither', figure: { kind: 'lines', angle: 60 } },
      { label: 'The letter V', bin: 'neither', figure: { kind: 'letter', text: 'V' } },
      {
        label: 'The hands of a clock at 1:00',
        bin: 'neither',
        figure: {
          kind: 'polygon',
          points: [
            [50, 10],
            [50, 50],
            [72, 12],
          ],
          open: true,
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.4.lines-symmetry~symmetry',
    title: 'Lines of symmetry',
    use: 'Use this to sort shapes by how many lines of symmetry they have.',
    assumptions: [
      'A line of symmetry folds a shape onto itself: both halves match exactly.',
      'Some shapes have no line of symmetry, some have one, some have several.',
      'A square has 4 lines of symmetry. A circle has more than you can count.',
      'Tap a card, then tap its group.',
    ],
    question: 'How many lines of symmetry does it have?',
    bins: [
      { id: 'none', label: 'No line of symmetry', why: 'No fold makes the halves match.' },
      { id: 'one', label: 'Exactly 1', why: 'One fold works: the two halves are mirror images.' },
      { id: 'many', label: '2 or more', why: 'More than one fold makes the halves match.' },
    ],
    cards: [
      {
        label: 'Scalene triangle (all sides different)',
        bin: 'none',
        figure: {
          kind: 'polygon',
          points: [
            [5, 90],
            [95, 75],
            [35, 10],
          ],
        },
      },
      { label: 'The letter F', bin: 'none', figure: { kind: 'letter', text: 'F' } },
      { label: 'The letter Z', bin: 'none', figure: { kind: 'letter', text: 'Z' } },
      {
        label: 'Isosceles triangle (two equal sides)',
        bin: 'one',
        figure: {
          kind: 'polygon',
          points: [
            [10, 90],
            [90, 90],
            [50, 5],
          ],
        },
      },
      { label: 'The letter A', bin: 'one', figure: { kind: 'letter', text: 'A' } },
      {
        label: 'Kite',
        bin: 'one',
        figure: {
          kind: 'polygon',
          points: [
            [50, 0],
            [90, 35],
            [50, 100],
            [10, 35],
          ],
        },
      },
      { label: 'Heart shape', bin: 'one', figure: { kind: 'heart' } },
      {
        label: 'Square',
        bin: 'many',
        figure: {
          kind: 'polygon',
          points: [
            [10, 10],
            [90, 10],
            [90, 90],
            [10, 90],
          ],
        },
      },
      {
        label: 'Rectangle',
        bin: 'many',
        figure: {
          kind: 'polygon',
          points: [
            [5, 25],
            [95, 25],
            [95, 75],
            [5, 75],
          ],
        },
      },
      { label: 'The letter H', bin: 'many', figure: { kind: 'letter', text: 'H' } },
      { label: 'Circle', bin: 'many', figure: { kind: 'circle' } },
    ],
  },
  {
    kind: 'sort',
    id: 'm.4.lines-symmetry~classify-shapes',
    title: 'Sort shapes by angles and sides',
    use: 'Use this to sort triangles and four-sided shapes by their angles and sides.',
    assumptions: [
      'A right triangle has one right angle, a square corner.',
      'Parallel sides go the same way and never meet.',
      'A four-sided shape can have two pairs of parallel sides, one pair, or none.',
      'Tap a card, then tap its group.',
    ],
    question: 'Does it have a right angle? Does it have parallel sides?',
    bins: [
      { id: 'right', label: 'Triangle with a right angle', why: 'One corner is a square corner.' },
      {
        id: 'triangle',
        label: 'Triangle, no right angle',
        why: 'Every corner is smaller or bigger than a square corner.',
      },
      {
        id: 'parallel',
        label: 'Four sides, some parallel',
        why: 'At least one pair of sides goes the same way.',
      },
      { id: 'none', label: 'Four sides, none parallel', why: 'No two sides go the same way.' },
    ],
    cards: [
      {
        label: 'Right triangle',
        bin: 'right',
        figure: {
          kind: 'polygon',
          points: [
            [10, 90],
            [90, 90],
            [10, 10],
          ],
        },
      },
      {
        label: 'Right triangle, two equal sides',
        bin: 'right',
        figure: {
          kind: 'polygon',
          points: [
            [10, 90],
            [90, 90],
            [90, 10],
          ],
        },
      },
      {
        label: 'Acute triangle (all angles small)',
        bin: 'triangle',
        figure: {
          kind: 'polygon',
          points: [
            [10, 90],
            [90, 90],
            [50, 10],
          ],
        },
      },
      {
        label: 'Obtuse triangle (one wide angle)',
        bin: 'triangle',
        figure: {
          kind: 'polygon',
          points: [
            [5, 90],
            [70, 90],
            [95, 40],
          ],
        },
      },
      {
        label: 'Equilateral triangle',
        bin: 'triangle',
        figure: {
          kind: 'polygon',
          points: [
            [10, 85],
            [90, 85],
            [50, 15],
          ],
        },
      },
      {
        label: 'Square',
        bin: 'parallel',
        figure: {
          kind: 'polygon',
          points: [
            [10, 10],
            [90, 10],
            [90, 90],
            [10, 90],
          ],
        },
      },
      {
        label: 'Rectangle',
        bin: 'parallel',
        figure: {
          kind: 'polygon',
          points: [
            [5, 25],
            [95, 25],
            [95, 75],
            [5, 75],
          ],
        },
      },
      {
        label: 'Parallelogram',
        bin: 'parallel',
        figure: {
          kind: 'polygon',
          points: [
            [25, 25],
            [95, 25],
            [75, 75],
            [5, 75],
          ],
        },
      },
      {
        label: 'Rhombus',
        bin: 'parallel',
        figure: {
          kind: 'polygon',
          points: [
            [50, 5],
            [90, 50],
            [50, 95],
            [10, 50],
          ],
        },
      },
      {
        label: 'Trapezoid (one pair of parallel sides)',
        bin: 'parallel',
        figure: {
          kind: 'polygon',
          points: [
            [30, 25],
            [70, 25],
            [95, 75],
            [5, 75],
          ],
        },
      },
      {
        label: 'Kite',
        bin: 'none',
        figure: {
          kind: 'polygon',
          points: [
            [50, 0],
            [90, 35],
            [50, 100],
            [10, 35],
          ],
        },
      },
      {
        label: 'Four sides, all different',
        bin: 'none',
        figure: {
          kind: 'polygon',
          points: [
            [10, 80],
            [45, 95],
            [90, 55],
            [35, 10],
          ],
        },
      },
    ],
  },
  // ── Grade 5: classify two-dimensional figures in a hierarchy (5.G.3, 5.G.4) ──
  {
    kind: 'sort',
    id: 'm.5.classify-2d',
    assumptions: [
      'A parallelogram has two pairs of parallel sides. A trapezoid has exactly one pair.',
      'A rectangle is a parallelogram with four right angles. A rhombus has four equal sides.',
      'A square is both: four right angles and four equal sides. Give the most exact name.',
      'Tap a card, then tap its group.',
    ],
    question: 'What is the most exact name for the four-sided shape?',
    bins: [
      { id: 'square', label: 'Square', why: 'Four right angles and four equal sides.' },
      {
        id: 'rectangle',
        label: 'Rectangle, not a square',
        why: 'Four right angles, but the sides are not all equal.',
      },
      {
        id: 'rhombus',
        label: 'Rhombus, not a square',
        why: 'Four equal sides, but the corners are not right angles.',
      },
      {
        id: 'parallelogram',
        label: 'Parallelogram only',
        why: 'Two pairs of parallel sides, no right angles, sides not all equal.',
      },
      {
        id: 'trapezoid',
        label: 'Trapezoid',
        why: 'Exactly one pair of parallel sides.',
      },
    ],
    cards: [
      {
        label: 'All sides 4, all corners square',
        bin: 'square',
        figure: {
          kind: 'polygon',
          points: [
            [20, 20],
            [80, 20],
            [80, 80],
            [20, 80],
          ],
        },
      },
      {
        label: 'Sides 6 and 3, all corners square',
        bin: 'rectangle',
        figure: {
          kind: 'polygon',
          points: [
            [5, 30],
            [95, 30],
            [95, 70],
            [5, 70],
          ],
        },
      },
      {
        label: 'All sides 5, corners leaning',
        bin: 'rhombus',
        figure: {
          kind: 'polygon',
          points: [
            [50, 5],
            [90, 50],
            [50, 95],
            [10, 50],
          ],
        },
      },
      {
        label: 'Sides 7 and 4, corners leaning',
        bin: 'parallelogram',
        figure: {
          kind: 'polygon',
          points: [
            [25, 25],
            [95, 25],
            [75, 75],
            [5, 75],
          ],
        },
      },
      {
        label: 'Top and bottom parallel, sides slanting in',
        bin: 'trapezoid',
        figure: {
          kind: 'polygon',
          points: [
            [30, 25],
            [70, 25],
            [95, 75],
            [5, 75],
          ],
        },
      },
      {
        label: 'One square corner, top and bottom parallel',
        bin: 'trapezoid',
        figure: {
          kind: 'polygon',
          points: [
            [10, 25],
            [60, 25],
            [90, 75],
            [10, 75],
          ],
        },
      },
      {
        label: 'A square turned on its corner',
        bin: 'square',
        figure: {
          kind: 'polygon',
          points: [
            [50, 8],
            [92, 50],
            [50, 92],
            [8, 50],
          ],
        },
      },
      {
        label: 'Sides 8 and 2, all corners square',
        bin: 'rectangle',
        figure: {
          kind: 'polygon',
          points: [
            [5, 40],
            [95, 40],
            [95, 60],
            [5, 60],
          ],
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.5.classify-2d~triangles',
    title: 'Sort triangles by their sides',
    use: 'Use this to name a triangle by how many of its sides are equal.',
    assumptions: [
      'An equilateral triangle has three equal sides. Its three angles are equal too.',
      'An isosceles triangle has two equal sides. A scalene triangle has no equal sides.',
      'A right triangle can be isosceles or scalene, never equilateral.',
      'Tap a card, then tap its group.',
    ],
    question: 'How many sides are equal?',
    bins: [
      { id: 'equilateral', label: 'Equilateral: 3 equal sides', why: 'All three sides match.' },
      { id: 'isosceles', label: 'Isosceles: 2 equal sides', why: 'Two sides match, one differs.' },
      { id: 'scalene', label: 'Scalene: no equal sides', why: 'All three sides are different.' },
    ],
    cards: [
      {
        label: 'Sides 6, 6, 6',
        bin: 'equilateral',
        figure: {
          kind: 'polygon',
          points: [
            [10, 85],
            [90, 85],
            [50, 15],
          ],
        },
      },
      {
        label: 'Sides 5, 5, 8',
        bin: 'isosceles',
        figure: {
          kind: 'polygon',
          points: [
            [5, 80],
            [95, 80],
            [50, 40],
          ],
        },
      },
      {
        label: 'Sides 3, 4, 5, with a right angle',
        bin: 'scalene',
        figure: {
          kind: 'polygon',
          points: [
            [10, 85],
            [90, 85],
            [10, 25],
          ],
        },
      },
      {
        label: 'Sides 7, 7, 4',
        bin: 'isosceles',
        figure: {
          kind: 'polygon',
          points: [
            [30, 90],
            [70, 90],
            [50, 10],
          ],
        },
      },
      {
        label: 'Sides 4, 6, 8',
        bin: 'scalene',
        figure: {
          kind: 'polygon',
          points: [
            [5, 85],
            [95, 85],
            [30, 30],
          ],
        },
      },
      {
        label: 'Sides 5, 5, 5, turned',
        bin: 'equilateral',
        figure: {
          kind: 'polygon',
          points: [
            [15, 20],
            [85, 35],
            [35, 90],
          ],
        },
      },
      {
        label: 'Two equal sides meeting at a right angle',
        bin: 'isosceles',
        figure: {
          kind: 'polygon',
          points: [
            [15, 85],
            [85, 85],
            [15, 15],
          ],
        },
      },
    ],
  },
];
