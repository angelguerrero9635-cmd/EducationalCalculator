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
    id: 'm.K.classify-count',
    assumptions: [
      'Put each shape in one group. Count each group.',
      'Which group has the most? Which has the fewest?',
    ],
    question: 'What shape is it?',
    bins: [
      { id: 'circle', label: 'Circles', why: 'A circle is round with no corners.' },
      { id: 'square', label: 'Squares', why: 'A square has 4 same sides and 4 corners.' },
      { id: 'triangle', label: 'Triangles', why: 'A triangle has 3 sides and 3 corners.' },
    ],
    cards: [
      { label: 'Big circle', bin: 'circle', figure: { kind: 'circle' } },
      {
        label: 'Small circle',
        bin: 'circle',
        figure: {
          kind: 'polygon',
          points: [
            [50, 26],
            [56, 27],
            [62, 29],
            [67, 33],
            [71, 38],
            [73, 44],
            [74, 50],
            [73, 56],
            [71, 62],
            [67, 67],
            [62, 71],
            [56, 73],
            [50, 74],
            [44, 73],
            [38, 71],
            [33, 67],
            [29, 62],
            [27, 56],
            [26, 50],
            [27, 44],
            [29, 38],
            [33, 33],
            [38, 29],
            [44, 27],
          ],
        },
      },
      {
        label: 'Big square',
        bin: 'square',
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
        label: 'Turned square',
        bin: 'square',
        figure: {
          kind: 'polygon',
          points: [
            [50, 2],
            [98, 50],
            [50, 98],
            [2, 50],
          ],
        },
      },
      {
        label: 'Small square',
        bin: 'square',
        figure: {
          kind: 'polygon',
          points: [
            [33, 33],
            [67, 33],
            [67, 67],
            [33, 67],
          ],
        },
      },
      {
        label: 'Tall triangle',
        bin: 'triangle',
        figure: {
          kind: 'polygon',
          points: [
            [40, 98],
            [60, 98],
            [50, 2],
          ],
        },
      },
      {
        label: 'Triangle point down',
        bin: 'triangle',
        figure: {
          kind: 'polygon',
          points: [
            [5, 8],
            [95, 8],
            [50, 95],
          ],
        },
      },
      {
        label: 'Small triangle',
        bin: 'triangle',
        figure: {
          kind: 'polygon',
          points: [
            [35, 68],
            [65, 68],
            [50, 40],
          ],
        },
      },
      {
        label: 'Big triangle',
        bin: 'triangle',
        figure: {
          kind: 'polygon',
          points: [
            [5, 95],
            [95, 95],
            [50, 5],
          ],
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.K.shapes-2d-3d',
    assumptions: [
      'Turn it or make it bigger: the name stays the same.',
      'Count the sides to check.',
    ],
    question: 'What shape is it?',
    bins: [
      { id: 'circle', label: 'Circle', why: 'A circle is round. It has no sides or corners.' },
      { id: 'triangle', label: 'Triangle', why: 'A triangle has 3 sides and 3 corners.' },
      { id: 'square', label: 'Square', why: 'A square has 4 same sides and 4 corners.' },
      {
        id: 'rectangle',
        label: 'Rectangle',
        why: 'A rectangle has 4 sides and 4 square corners.',
      },
      { id: 'hexagon', label: 'Hexagon', why: 'A hexagon has 6 sides and 6 corners.' },
    ],
    cards: [
      { label: 'Circle', bin: 'circle', figure: { kind: 'circle' } },
      {
        label: 'Small circle',
        bin: 'circle',
        figure: {
          kind: 'polygon',
          points: [
            [50, 26],
            [56, 27],
            [62, 29],
            [67, 33],
            [71, 38],
            [73, 44],
            [74, 50],
            [73, 56],
            [71, 62],
            [67, 67],
            [62, 71],
            [56, 73],
            [50, 74],
            [44, 73],
            [38, 71],
            [33, 67],
            [29, 62],
            [27, 56],
            [26, 50],
            [27, 44],
            [29, 38],
            [33, 33],
            [38, 29],
            [44, 27],
          ],
        },
      },
      {
        label: 'Triangle',
        bin: 'triangle',
        figure: {
          kind: 'polygon',
          points: [
            [5, 95],
            [95, 95],
            [50, 5],
          ],
        },
      },
      {
        label: 'Triangle point down',
        bin: 'triangle',
        figure: {
          kind: 'polygon',
          points: [
            [5, 8],
            [95, 8],
            [50, 95],
          ],
        },
      },
      {
        label: 'Long thin triangle',
        bin: 'triangle',
        figure: {
          kind: 'polygon',
          points: [
            [40, 98],
            [60, 98],
            [50, 2],
          ],
        },
      },
      {
        label: 'Triangle on its side',
        bin: 'triangle',
        figure: {
          kind: 'polygon',
          points: [
            [5, 20],
            [5, 80],
            [95, 50],
          ],
        },
      },
      {
        label: 'Square',
        bin: 'square',
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
        label: 'Square on its corner',
        bin: 'square',
        figure: {
          kind: 'polygon',
          points: [
            [50, 2],
            [98, 50],
            [50, 98],
            [2, 50],
          ],
        },
      },
      {
        label: 'Long rectangle',
        bin: 'rectangle',
        figure: {
          kind: 'polygon',
          points: [
            [2, 30],
            [98, 30],
            [98, 70],
            [2, 70],
          ],
        },
      },
      {
        label: 'Rectangle standing up',
        bin: 'rectangle',
        figure: {
          kind: 'polygon',
          points: [
            [30, 2],
            [70, 2],
            [70, 98],
            [30, 98],
          ],
        },
      },
      {
        label: 'Hexagon',
        bin: 'hexagon',
        figure: {
          kind: 'polygon',
          points: [
            [98, 50],
            [74, 92],
            [26, 92],
            [2, 50],
            [26, 8],
            [74, 8],
          ],
        },
      },
      {
        label: 'Small hexagon',
        bin: 'hexagon',
        figure: {
          kind: 'polygon',
          points: [
            [76, 50],
            [63, 73],
            [37, 73],
            [24, 50],
            [37, 27],
            [63, 27],
          ],
        },
      },
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
    ],
    question: 'Is it flat or solid?',
    bins: [
      { id: 'flat', label: 'Flat', why: 'Flat shapes can be drawn on paper.' },
      { id: 'solid', label: 'Solid', why: 'Solid shapes can be held in your hand.' },
    ],
    cards: [
      { label: 'Circle', bin: 'flat', figure: { kind: 'circle' } },
      {
        label: 'Square',
        bin: 'flat',
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
        label: 'Triangle',
        bin: 'flat',
        figure: {
          kind: 'polygon',
          points: [
            [5, 95],
            [95, 95],
            [50, 5],
          ],
        },
      },
      {
        label: 'Hexagon',
        bin: 'flat',
        figure: {
          kind: 'polygon',
          points: [
            [98, 50],
            [74, 92],
            [26, 92],
            [2, 50],
            [26, 8],
            [74, 8],
          ],
        },
      },
      { label: 'Sphere (a ball)', bin: 'solid', figure: { kind: 'solid', shape: 'sphere' } },
      { label: 'Cube (a box)', bin: 'solid', figure: { kind: 'solid', shape: 'cube' } },
      { label: 'Cylinder (a can)', bin: 'solid', figure: { kind: 'solid', shape: 'cylinder' } },
      { label: 'Cone', bin: 'solid', figure: { kind: 'solid', shape: 'cone' } },
    ],
  },
  {
    kind: 'sort',
    id: 'm.K.shapes-2d-3d~rolls',
    title: 'Does it roll or stack?',
    use: 'Use this to find which solids roll and which stack.',
    assumptions: ['A solid with a curved side rolls.', 'A solid with flat sides stacks.'],
    question: 'Does it roll, stack, or both?',
    bins: [
      { id: 'rolls', label: 'Rolls', why: 'It has a curved side, so it rolls. It will not stack.' },
      { id: 'stacks', label: 'Stacks', why: 'Flat sides all round: it stacks but will not roll.' },
      { id: 'both', label: 'Rolls and stacks', why: 'Flat ends and a curved side: it does both.' },
    ],
    cards: [
      { label: 'Sphere (a ball)', bin: 'rolls', figure: { kind: 'solid', shape: 'sphere' } },
      { label: 'Cone (a party hat)', bin: 'rolls', figure: { kind: 'solid', shape: 'cone' } },
      { label: 'Cube (a box)', bin: 'stacks', figure: { kind: 'solid', shape: 'cube' } },
      { label: 'Book', bin: 'stacks', figure: { kind: 'solid', shape: 'box' } },
      { label: 'Cereal box', bin: 'stacks', figure: { kind: 'solid', shape: 'box' } },
      { label: 'Cylinder (a can)', bin: 'both', figure: { kind: 'solid', shape: 'cylinder' } },
      { label: 'Glue stick', bin: 'both', figure: { kind: 'solid', shape: 'cylinder' } },
    ],
  },
  {
    kind: 'sort',
    id: 'm.K.measurable-attributes~weight',
    title: 'Heavier and lighter',
    use: 'Use this to tell heavier things from lighter things.',
    assumptions: [
      'Hold one in each hand. The heavier one pulls down.',
      'On a balance, the heavier side goes down.',
    ],
    question: 'Is it heavier or lighter than your shoe?',
    bins: [
      { id: 'heavier', label: 'Heavier', why: 'It pulls your hand down more.' },
      { id: 'lighter', label: 'Lighter', why: 'It is easy to lift.' },
    ],
    cards: [
      { label: 'Feather', bin: 'lighter', figure: { kind: 'icon', icon: 'feather' } },
      { label: 'Leaf', bin: 'lighter', figure: { kind: 'icon', icon: 'leaf' } },
      { label: 'Crayon', bin: 'lighter', figure: { kind: 'icon', icon: 'crayon' } },
      { label: 'Sock', bin: 'lighter', figure: { kind: 'icon', icon: 'sock' } },
      { label: 'Brick', bin: 'heavier', figure: { kind: 'icon', icon: 'brick' } },
      { label: 'Watermelon', bin: 'heavier', figure: { kind: 'icon', icon: 'watermelon' } },
      { label: 'Full backpack', bin: 'heavier', figure: { kind: 'icon', icon: 'backpack' } },
      { label: 'Bowling ball', bin: 'heavier', figure: { kind: 'icon', icon: 'bowling ball' } },
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
      { label: 'Beside', position: 'beside', lines: ['The ball is beside the box.'] },
      {
        label: 'Next to',
        position: 'beside',
        lines: ['Next to means beside. The ball is next to the box.'],
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
      { label: '7 − 1 = 4 + 2', bin: 'true' },
      { label: '9 − 4 = 5', bin: 'true' },
      { label: '8 = 10 − 3', bin: 'false' },
    ],
  },
  {
    kind: 'sequence',
    id: 'm.1.measure-nonstandard~order',
    title: 'Order three ribbons',
    use: 'Use this to order three things from longest to shortest.',
    assumptions: [
      'Line up the ribbons at one end to compare them.',
      'Red is longer than blue. Blue is longer than green. So red is longer than green.',
      'Tap the ribbons in order, longest first.',
    ],
    question: 'Put the ribbons in order, longest first.',
    stages: [
      { label: 'Red ribbon', figure: { kind: 'bar', length: 9 } },
      { label: 'Blue ribbon', figure: { kind: 'bar', length: 6 } },
      { label: 'Green ribbon', figure: { kind: 'bar', length: 4 } },
    ],
  },
  {
    kind: 'sort',
    id: 'm.1.measure-nonstandard~right-way',
    title: 'Measured the right way?',
    use: 'Use this to spot a length measured the wrong way.',
    assumptions: [
      'Start at the end of the object.',
      'Lay the cubes end to end, with no gaps and no overlaps.',
    ],
    question: 'Was the ribbon measured the right way?',
    bins: [
      { id: 'right', label: 'Measured right', why: 'Same cubes, end to end, from the very end.' },
      {
        id: 'wrong',
        label: 'Not right',
        why: 'A gap, an overlap or a wrong start changes the count.',
      },
    ],
    cards: [
      {
        label: 'End to end from the end',
        bin: 'right',
        figure: { kind: 'bar', length: 6, units: 'cubes' },
      },
      {
        label: 'Short ribbon, end to end',
        bin: 'right',
        figure: { kind: 'bar', length: 3, units: 'cubes' },
      },
      {
        label: 'Gaps between cubes',
        bin: 'wrong',
        figure: { kind: 'bar', length: 6, units: 'gap' },
      },
      {
        label: 'Cubes overlapping',
        bin: 'wrong',
        figure: { kind: 'bar', length: 6, units: 'overlap' },
      },
      {
        label: 'Starting past the end',
        bin: 'wrong',
        figure: { kind: 'bar', length: 5, units: 'offset' },
      },
    ],
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
        label: '12 o’clock',
        time: [12, 0],
        lines: ['Both hands point to 12.', 'It is 12:00.'],
      },
      {
        label: 'Half past 12',
        time: [12, 30],
        lines: [
          'The long hand points to 6.',
          'The short hand is halfway between 12 and 1.',
          'It is 12:30.',
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
    ],
    question: 'Are the parts equal?',
    bins: [
      { id: 'equal', label: 'Equal parts', why: 'Every part is the same size.' },
      { id: 'unequal', label: 'Not equal parts', why: 'One part is bigger than another.' },
    ],
    cards: [
      {
        label: 'Circle in 2 same parts',
        bin: 'equal',
        figure: { kind: 'cut', shape: 'circle', parts: 2, equal: true, shaded: 1 },
      },
      {
        label: 'Square in 4 same parts',
        bin: 'equal',
        figure: { kind: 'cut', shape: 'square', parts: 4, equal: true, shaded: 1 },
      },
      {
        label: 'Rectangle folded in half',
        bin: 'equal',
        figure: { kind: 'cut', shape: 'rectangle', parts: 2, equal: true, shaded: 1 },
      },
      {
        label: 'Square cut corner to corner',
        bin: 'equal',
        figure: {
          kind: 'cut',
          shape: 'square',
          parts: 2,
          equal: true,
          cuts: 'diagonal',
          shaded: 1,
        },
      },
      {
        label: 'Cut in 2, one part bigger',
        bin: 'unequal',
        figure: { kind: 'cut', shape: 'rectangle', parts: 2, equal: false, shaded: 1 },
      },
      {
        label: 'Cut in 3, all different sizes',
        bin: 'unequal',
        figure: { kind: 'cut', shape: 'rectangle', parts: 3, equal: false },
      },
      {
        label: 'Circle, one big piece',
        bin: 'unequal',
        figure: { kind: 'cut', shape: 'circle', parts: 2, equal: false, shaded: 1 },
      },
    ],
  },

  {
    kind: 'sort',
    id: 'm.1.shape-attributes',
    assumptions: [
      'Sides, corners and being closed decide the name.',
      'Color, size and turning do not change the name.',
    ],
    question: 'Is it a triangle?',
    bins: [
      { id: 'yes', label: 'Triangle', why: '3 straight sides, 3 corners, closed.' },
      {
        id: 'no',
        label: 'Not a triangle',
        why: 'Something is missing: a side, a corner, or it is open.',
      },
    ],
    cards: [
      {
        label: 'Big triangle',
        bin: 'yes',
        figure: {
          kind: 'polygon',
          points: [
            [5, 95],
            [95, 95],
            [50, 5],
          ],
        },
      },
      {
        label: 'Small triangle',
        bin: 'yes',
        figure: {
          kind: 'polygon',
          points: [
            [30, 75],
            [70, 75],
            [50, 40],
          ],
        },
      },
      {
        label: 'Triangle point down',
        bin: 'yes',
        figure: {
          kind: 'polygon',
          points: [
            [5, 8],
            [95, 8],
            [50, 95],
          ],
        },
      },
      {
        label: 'Long thin triangle',
        bin: 'yes',
        figure: {
          kind: 'polygon',
          points: [
            [40, 98],
            [60, 98],
            [50, 2],
          ],
        },
      },
      {
        label: 'Triangle on its side',
        bin: 'yes',
        figure: {
          kind: 'polygon',
          points: [
            [5, 20],
            [5, 80],
            [95, 50],
          ],
        },
      },
      {
        label: 'Three lines not joined',
        bin: 'no',
        figure: {
          kind: 'polygon',
          points: [
            [20, 95],
            [50, 5],
            [80, 95],
            [30, 95],
          ],
          open: true,
        },
      },
      {
        label: '4-sided shape',
        bin: 'no',
        figure: {
          kind: 'polygon',
          points: [
            [10, 20],
            [90, 10],
            [95, 85],
            [15, 90],
          ],
        },
      },
      {
        label: 'One curved side',
        bin: 'no',
        figure: {
          kind: 'polygon',
          points: [
            [5, 95],
            [95, 95],
            [50, 5],
          ],
          curved: 0,
        },
      },
      { label: 'Circle', bin: 'no', figure: { kind: 'circle' } },
    ],
  },
  {
    kind: 'sort',
    id: 'm.1.shape-attributes~name-changes',
    title: 'What changes the name?',
    use: 'Use this to tell what changes a shape’s name.',
    assumptions: [
      'Some things decide a shape’s name.',
      'Other things can change and the name stays.',
    ],
    question: 'Does it change the shape’s name?',
    bins: [
      {
        id: 'changes',
        label: 'Changes the name',
        why: 'It changes the sides, the corners or the outline.',
      },
      {
        id: 'stays',
        label: 'Doesn’t change the name',
        why: 'The shape looks different but keeps its name.',
      },
    ],
    cards: [
      { label: 'Number of sides', bin: 'changes' },
      { label: 'Number of corners', bin: 'changes' },
      { label: 'Open or closed', bin: 'changes' },
      { label: 'Straight or curved sides', bin: 'changes' },
      { label: 'Color', bin: 'stays' },
      { label: 'Size', bin: 'stays' },
      { label: 'Turned over', bin: 'stays' },
      { label: 'Turned around', bin: 'stays' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.1.halves-fourths~bigger-share',
    title: 'Which share is bigger?',
    use: 'Use this to tell whether a half or a fourth is bigger.',
    assumptions: [
      'Cut the same shape into more parts: each part is smaller.',
      'Half a pizza is bigger than a fourth of that pizza.',
    ],
    question: 'Is the shaded share a half or a fourth?',
    bins: [
      {
        id: 'half',
        label: 'Half: the bigger share',
        why: '2 equal parts. Each is bigger than a fourth.',
      },
      {
        id: 'fourth',
        label: 'Fourth: the smaller share',
        why: '4 equal parts. Each is smaller than a half.',
      },
    ],
    cards: [
      {
        label: 'Half a pizza',
        bin: 'half',
        figure: { kind: 'cut', shape: 'circle', parts: 2, equal: true, shaded: 1 },
      },
      {
        label: 'A fourth of a pizza',
        bin: 'fourth',
        figure: { kind: 'cut', shape: 'circle', parts: 4, equal: true, shaded: 1 },
      },
      {
        label: 'Half a sandwich',
        bin: 'half',
        figure: {
          kind: 'cut',
          shape: 'square',
          parts: 2,
          equal: true,
          cuts: 'diagonal',
          shaded: 1,
        },
      },
      {
        label: 'A fourth of a sandwich',
        bin: 'fourth',
        figure: { kind: 'cut', shape: 'square', parts: 4, equal: true, shaded: 1 },
      },
      {
        label: 'Half a bar',
        bin: 'half',
        figure: { kind: 'cut', shape: 'rectangle', parts: 2, equal: true, shaded: 1 },
      },
      {
        label: 'A fourth of a bar',
        bin: 'fourth',
        figure: { kind: 'cut', shape: 'rectangle', parts: 4, equal: true, shaded: 1 },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.1.tens-ones~compare-sort',
    title: 'Greater, less or equal?',
    use: 'Use this to pick >, < or = for two numbers.',
    assumptions: [
      'Compare the tens first. If they are the same, compare the ones.',
      'The open side of > or < faces the greater number.',
    ],
    question: 'Which sign goes in the blank?',
    bins: [
      {
        id: 'gt',
        label: 'is greater than (>)',
        why: 'The first number has more tens, or more ones.',
      },
      {
        id: 'lt',
        label: 'is less than (<)',
        why: 'The first number has fewer tens, or fewer ones.',
      },
      { id: 'eq', label: 'is equal to (=)', why: 'Same tens and same ones.' },
    ],
    cards: [
      { label: '45 __ 54', bin: 'lt' },
      { label: '70 __ 17', bin: 'gt' },
      { label: '38 __ 38', bin: 'eq' },
      { label: '61 __ 16', bin: 'gt' },
      { label: '29 __ 92', bin: 'lt' },
      { label: '50 __ 5 tens', bin: 'eq' },
    ],
  },

  // ── Grade 2 ──

  {
    kind: 'sort',
    id: 'm.2.even-odd~sort',
    title: 'Even or odd?',
    use: 'Use this to sort numbers to 20 as even or odd.',
    assumptions: [
      'Put the dots in pairs.',
      'Even: every dot has a partner. Odd: one is left over.',
    ],
    question: 'Is the number even or odd?',
    bins: [
      { id: 'even', label: 'Even', why: 'Pairs with none left over.' },
      { id: 'odd', label: 'Odd', why: 'One is left without a partner.' },
    ],
    cards: [
      { label: '3', bin: 'odd', figure: { kind: 'dots', count: 3 } },
      { label: '8', bin: 'even', figure: { kind: 'dots', count: 8 } },
      { label: '11', bin: 'odd', figure: { kind: 'dots', count: 11 } },
      { label: '14', bin: 'even', figure: { kind: 'dots', count: 14 } },
      { label: '17', bin: 'odd', figure: { kind: 'dots', count: 17 } },
      { label: '20', bin: 'even', figure: { kind: 'dots', count: 20 } },
      { label: '0', bin: 'even' },
      { label: '9', bin: 'odd', figure: { kind: 'dots', count: 9 } },
    ],
  },
  {
    kind: 'sort',
    id: 'm.2.standard-length~which-unit',
    title: 'Which unit?',
    use: 'Use this to pick the best unit.',
    assumptions: [
      'Small things: centimeters. Big things: meters.',
      'A bigger unit means you need fewer of them.',
    ],
    question: 'Would you measure it in centimeters or meters?',
    bins: [
      { id: 'cm', label: 'Centimeters', why: 'It is small. It fits on a ruler.' },
      { id: 'm', label: 'Meters', why: 'It is big. Use a meter stick.' },
    ],
    cards: [
      { label: 'Paper clip', bin: 'cm', figure: { kind: 'icon', icon: 'paper clip' } },
      { label: 'Crayon', bin: 'cm', figure: { kind: 'icon', icon: 'crayon' } },
      { label: 'Eraser', bin: 'cm', figure: { kind: 'icon', icon: 'eraser' } },
      { label: 'Door', bin: 'm', figure: { kind: 'icon', icon: 'door' } },
      { label: 'School bus', bin: 'm', figure: { kind: 'icon', icon: 'bus' } },
      { label: 'Hallway', bin: 'm' },
      { label: 'Classroom', bin: 'm' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.2.time-5-min~am-pm',
    title: 'a.m. or p.m.?',
    use: 'Use this to tell a.m. from p.m.',
    assumptions: ['a.m. is from midnight to noon.', 'p.m. is from noon to midnight.'],
    question: 'Does it happen in the a.m. or the p.m.?',
    bins: [
      { id: 'am', label: 'a.m.', why: 'Midnight to noon: the morning.' },
      { id: 'pm', label: 'p.m.', why: 'Noon to midnight: afternoon and evening.' },
    ],
    cards: [
      { label: 'Eat breakfast', bin: 'am' },
      { label: 'Walk to school', bin: 'am', figure: { kind: 'icon', icon: 'backpack' } },
      { label: 'See the sunrise', bin: 'am', figure: { kind: 'icon', icon: 'sun' } },
      { label: 'Eat dinner', bin: 'pm' },
      { label: 'Go to bed', bin: 'pm', figure: { kind: 'icon', icon: 'bed' } },
      { label: 'See the moon come up', bin: 'pm', figure: { kind: 'icon', icon: 'moon' } },
    ],
  },
  {
    kind: 'sort',
    id: 'm.2.thirds-polygons~polygons',
    title: 'Name the shape',
    use: 'Use this to name shapes by their sides and angles.',
    assumptions: [
      'Count the sides. Count the angles. They match.',
      'Turned or stretched, the name stays the same.',
    ],
    question: 'What is its name?',
    bins: [
      { id: 'tri', label: 'Triangle', why: 'A triangle has 3 sides and 3 angles.' },
      { id: 'quad', label: 'Quadrilateral', why: 'A quadrilateral has 4 sides and 4 angles.' },
      { id: 'pent', label: 'Pentagon', why: 'A pentagon has 5 sides and 5 angles.' },
      { id: 'hex', label: 'Hexagon', why: 'A hexagon has 6 sides and 6 angles.' },
    ],
    cards: [
      {
        label: 'Leaning triangle',
        bin: 'tri',
        figure: {
          kind: 'polygon',
          points: [
            [5, 90],
            [95, 90],
            [30, 10],
          ],
        },
      },
      {
        label: 'Kite',
        bin: 'quad',
        figure: {
          kind: 'polygon',
          points: [
            [50, 2],
            [85, 35],
            [50, 98],
            [15, 35],
          ],
        },
      },
      {
        label: 'Trapezoid',
        bin: 'quad',
        figure: {
          kind: 'polygon',
          points: [
            [25, 20],
            [75, 20],
            [95, 80],
            [5, 80],
          ],
        },
      },
      {
        label: 'Rectangle',
        bin: 'quad',
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
        label: 'Pentagon',
        bin: 'pent',
        figure: {
          kind: 'polygon',
          points: [
            [50, 5],
            [95, 40],
            [78, 95],
            [22, 95],
            [5, 40],
          ],
        },
      },
      {
        label: 'Long pentagon',
        bin: 'pent',
        figure: {
          kind: 'polygon',
          points: [
            [10, 30],
            [60, 10],
            [95, 45],
            [70, 90],
            [10, 80],
          ],
        },
      },
      {
        label: 'Hexagon',
        bin: 'hex',
        figure: {
          kind: 'polygon',
          points: [
            [96, 50],
            [73, 90],
            [27, 90],
            [4, 50],
            [27, 10],
            [73, 10],
          ],
        },
      },
      {
        label: 'Hexagon with a dent',
        bin: 'hex',
        figure: {
          kind: 'polygon',
          points: [
            [5, 20],
            [70, 20],
            [95, 50],
            [70, 80],
            [5, 80],
            [30, 50],
          ],
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.2.thirds-polygons~same-share',
    title: 'Equal shares, different shapes',
    use: 'Use this to see equal shares that are not the same shape.',
    assumptions: [
      'Equal shares are the same amount of the whole.',
      'They do not have to be the same shape.',
    ],
    question: 'Are the shares halves of the square?',
    bins: [
      { id: 'yes', label: 'Halves', why: 'Two shares, each the same amount of the square.' },
      { id: 'no', label: 'Not halves', why: 'One share is bigger than the other.' },
    ],
    cards: [
      {
        label: 'Two rectangles',
        bin: 'yes',
        figure: { kind: 'cut', shape: 'square', parts: 2, equal: true, shaded: 1 },
      },
      {
        label: 'Two triangles',
        bin: 'yes',
        figure: {
          kind: 'cut',
          shape: 'square',
          parts: 2,
          equal: true,
          cuts: 'diagonal',
          shaded: 1,
        },
      },
      {
        label: 'One thin, one wide',
        bin: 'no',
        figure: { kind: 'cut', shape: 'square', parts: 2, equal: false, shaded: 1 },
      },
    ],
  },

  // ── Grade 3 ──
  {
    kind: 'explore',
    id: 'm.3.arithmetic-patterns',
    assumptions: [
      'A row of the times table counts by its row number.',
      'A pattern you can explain always works, not only on this table.',
      'Even numbers split into two equal groups.',
    ],
    figure: { kind: 'timesTable' },
    scenes: [
      {
        label: 'The 4s row',
        table: { op: '×', rows: [4] },
        lines: ['Each step along the row adds 4 more.', '4, 8, 12, 16: the 4s row counts by 4s.'],
      },
      {
        label: 'Even rows',
        table: { op: '×', rows: [2, 4, 6, 8, 10] },
        lines: [
          'Every number in an even row is even.',
          'Even × any number splits into two equal groups.',
        ],
      },
      {
        label: 'Odd times odd',
        table: { op: '×', cells: 'odd' },
        lines: ['Odd × odd is the only way to get an odd product.'],
      },
      {
        label: 'Turn-around facts',
        table: { op: '×', mirror: true },
        lines: ['4 × 7 and 7 × 4 sit across the diagonal. They are equal.'],
      },
      {
        label: 'Doubles',
        table: { op: '×', rows: [2, 4] },
        lines: ['Each number in the 4s row is double the one in the 2s row.'],
      },
      {
        label: 'The 9s row',
        table: { op: '×', rows: [9] },
        lines: ['The tens digit goes up 1 and the ones digit goes down 1.'],
      },
      {
        label: 'The 5s row',
        table: { op: '×', rows: [5] },
        lines: ['Every number ends in 0 or 5.'],
      },
      {
        label: 'Addition table',
        table: { op: '+', cells: 'even' },
        lines: ['Even + even and odd + odd are even. Even + odd is odd.'],
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.3.arithmetic-patterns~even-odd',
    title: 'Even or odd answer?',
    use: 'Use this to tell if an answer is even or odd without working it out.',
    assumptions: [
      'An even number times any number is even.',
      'Odd + odd is even. Even + odd is odd.',
    ],
    question: 'Is the answer even or odd?',
    bins: [
      { id: 'even', label: 'Even', why: 'It splits into two equal groups with none left over.' },
      { id: 'odd', label: 'Odd', why: 'One is left over after pairs.' },
    ],
    cards: [
      { label: '4 × 7', bin: 'even' },
      { label: '6 × 9', bin: 'even' },
      { label: '2 × 5', bin: 'even' },
      { label: '3 × 5', bin: 'odd' },
      { label: '7 × 7', bin: 'odd' },
      { label: '9 × 1', bin: 'odd' },
      { label: '8 + 6', bin: 'even' },
      { label: '5 + 9', bin: 'even' },
      { label: '3 + 4', bin: 'odd' },
      { label: '10 + 7', bin: 'odd' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.3.quadrilaterals',
    assumptions: [
      'A quadrilateral is a shape with 4 straight sides.',
      'A rectangle has 4 right angles. A rhombus has 4 equal sides.',
      'A square is both: it is a rectangle and a rhombus.',
    ],
    question: 'Which does it have: 4 right angles, 4 equal sides, both, or neither?',
    bins: [
      { id: 'angles', label: '4 right angles', why: 'Rectangles have 4 square corners.' },
      { id: 'sides', label: '4 equal sides', why: 'A rhombus has 4 sides the same length.' },
      { id: 'both', label: 'Both', why: 'A square has 4 right angles and 4 equal sides.' },
      { id: 'neither', label: 'Neither', why: 'Still a quadrilateral: 4 straight sides.' },
    ],
    cards: [
      {
        label: 'Shape A',
        bin: 'both',
        figure: {
          kind: 'polygon',
          points: [
            [15, 15],
            [85, 15],
            [85, 85],
            [15, 85],
          ],
          marks: true,
        },
      },
      {
        label: 'Shape B',
        bin: 'both',
        figure: {
          kind: 'polygon',
          points: [
            [50, 5],
            [95, 50],
            [50, 95],
            [5, 50],
          ],
          marks: true,
        },
      },
      {
        label: 'Shape C',
        bin: 'angles',
        figure: {
          kind: 'polygon',
          points: [
            [5, 30],
            [95, 30],
            [95, 70],
            [5, 70],
          ],
          marks: true,
        },
      },
      {
        label: 'Shape D',
        bin: 'angles',
        figure: {
          kind: 'polygon',
          points: [
            [30, 5],
            [70, 5],
            [70, 95],
            [30, 95],
          ],
          marks: true,
        },
      },
      {
        label: 'Shape E',
        bin: 'sides',
        figure: {
          kind: 'polygon',
          points: [
            [10, 80],
            [60, 80],
            [90, 40],
            [40, 40],
          ],
          marks: true,
        },
      },
      {
        label: 'Shape F',
        bin: 'sides',
        figure: {
          kind: 'polygon',
          points: [
            [50, 2],
            [80, 50],
            [50, 98],
            [20, 50],
          ],
          marks: true,
        },
      },
      {
        label: 'Shape G',
        bin: 'neither',
        figure: {
          kind: 'polygon',
          points: [
            [5, 80],
            [65, 80],
            [95, 25],
            [35, 25],
          ],
          marks: true,
        },
      },
      {
        label: 'Shape H',
        bin: 'neither',
        figure: {
          kind: 'polygon',
          points: [
            [20, 25],
            [80, 25],
            [95, 80],
            [5, 80],
          ],
          marks: true,
        },
      },
      {
        label: 'Shape I',
        bin: 'neither',
        figure: {
          kind: 'polygon',
          points: [
            [50, 5],
            [80, 35],
            [50, 95],
            [20, 35],
          ],
          marks: true,
        },
      },
      {
        label: 'Shape J',
        bin: 'neither',
        figure: {
          kind: 'polygon',
          points: [
            [10, 20],
            [60, 20],
            [90, 80],
            [10, 80],
          ],
          marks: true,
        },
      },
    ],
  },

  {
    kind: 'sort',
    id: 'm.3.quadrilaterals~is-quadrilateral',
    title: 'Quadrilateral or not?',
    use: 'Use this to tell a quadrilateral from other shapes.',
    assumptions: [
      'A quadrilateral has 4 straight sides and 4 corners.',
      'Its sides join up: the shape is closed.',
    ],
    question: 'Is it a quadrilateral?',
    bins: [
      { id: 'yes', label: 'Quadrilateral', why: '4 straight sides and 4 corners, closed.' },
      {
        id: 'no',
        label: 'Not a quadrilateral',
        why: 'Wrong number of sides, a curved side, or not closed.',
      },
    ],
    cards: [
      {
        label: 'Trapezoid',
        bin: 'yes',
        figure: {
          kind: 'polygon',
          points: [
            [20, 25],
            [80, 25],
            [95, 80],
            [5, 80],
          ],
        },
      },
      {
        label: 'Kite',
        bin: 'yes',
        figure: {
          kind: 'polygon',
          points: [
            [50, 5],
            [80, 35],
            [50, 95],
            [20, 35],
          ],
        },
      },
      {
        label: 'Rhombus',
        bin: 'yes',
        figure: {
          kind: 'polygon',
          points: [
            [10, 80],
            [60, 80],
            [90, 40],
            [40, 40],
          ],
        },
      },
      {
        label: 'Rectangle',
        bin: 'yes',
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
        label: 'Arrowhead',
        bin: 'yes',
        figure: {
          kind: 'polygon',
          points: [
            [10, 10],
            [90, 50],
            [10, 90],
            [35, 50],
          ],
        },
      },
      {
        label: 'Triangle',
        bin: 'no',
        figure: {
          kind: 'polygon',
          points: [
            [5, 90],
            [95, 90],
            [50, 10],
          ],
        },
      },
      {
        label: 'Pentagon',
        bin: 'no',
        figure: {
          kind: 'polygon',
          points: [
            [50, 5],
            [95, 40],
            [78, 95],
            [22, 95],
            [5, 40],
          ],
        },
      },
      { label: 'Circle', bin: 'no', figure: { kind: 'circle' } },
      {
        label: 'Open 4-sided shape',
        bin: 'no',
        figure: {
          kind: 'polygon',
          points: [
            [10, 90],
            [10, 10],
            [90, 10],
            [90, 90],
          ],
          open: true,
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.3.compare-fractions~which-greater',
    title: 'Which fraction is greater?',
    use: 'Use this to compare two fractions of the same whole.',
    assumptions: [
      'Same bottom number: the parts are the same size. More parts is more.',
      'Same top number: fewer, bigger parts is more.',
      'Compare only fractions of the same whole.',
    ],
    question: 'Which fraction is greater?',
    bins: [
      { id: 'first', label: 'First', why: 'It covers more of the same whole.' },
      { id: 'second', label: 'Second', why: 'It covers more of the same whole.' },
      { id: 'equal', label: 'Equal', why: 'They cover the same amount.' },
    ],
    cards: [
      {
        label: '3/8 or 5/8',
        bin: 'second',
        figure: {
          kind: 'fractionBars',
          bars: [
            [3, 8],
            [5, 8],
          ],
        },
      },
      {
        label: '2/3 or 2/6',
        bin: 'first',
        figure: {
          kind: 'fractionBars',
          bars: [
            [2, 3],
            [2, 6],
          ],
        },
      },
      {
        label: '1/4 or 1/2',
        bin: 'second',
        figure: {
          kind: 'fractionBars',
          bars: [
            [1, 4],
            [1, 2],
          ],
        },
      },
      {
        label: '5/6 or 3/6',
        bin: 'first',
        figure: {
          kind: 'fractionBars',
          bars: [
            [5, 6],
            [3, 6],
          ],
        },
      },
      {
        label: '3/4 or 3/8',
        bin: 'first',
        figure: {
          kind: 'fractionBars',
          bars: [
            [3, 4],
            [3, 8],
          ],
        },
      },
      {
        label: '2/4 or 1/2',
        bin: 'equal',
        figure: {
          kind: 'fractionBars',
          bars: [
            [2, 4],
            [1, 2],
          ],
        },
      },
      {
        label: '4/8 or 1/2',
        bin: 'equal',
        figure: {
          kind: 'fractionBars',
          bars: [
            [4, 8],
            [1, 2],
          ],
        },
      },
      {
        label: '1/3 or 1/6',
        bin: 'first',
        figure: {
          kind: 'fractionBars',
          bars: [
            [1, 3],
            [1, 6],
          ],
        },
      },
      {
        label: '2/8 or 2/3',
        bin: 'second',
        figure: {
          kind: 'fractionBars',
          bars: [
            [2, 8],
            [2, 3],
          ],
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.3.mass-liquid-volume~which-unit',
    title: 'Grams or kilograms?',
    use: 'Use this to pick grams or kilograms for an object.',
    assumptions: ['A paper clip is about 1 gram.', 'A textbook is about 1 kilogram.'],
    question: 'Would you weigh it in grams or kilograms?',
    bins: [
      { id: 'g', label: 'Grams', why: 'Light things: a paper clip is about 1 gram.' },
      { id: 'kg', label: 'Kilograms', why: 'Heavy things: a textbook is about 1 kilogram.' },
    ],
    cards: [
      { label: 'Paper clip', bin: 'g' },
      { label: 'Grape', bin: 'g' },
      { label: 'Pencil', bin: 'g' },
      { label: 'Apple', bin: 'g' },
      { label: 'Letter', bin: 'g' },
      { label: 'Bicycle', bin: 'kg' },
      { label: 'Dog', bin: 'kg' },
      { label: 'Watermelon', bin: 'kg' },
      { label: 'Bag of potatoes', bin: 'kg' },
      { label: 'Child', bin: 'kg' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.3.mass-liquid-volume~about-a-liter',
    title: 'More or less than a liter?',
    use: 'Use this to estimate whether a container holds more or less than 1 liter.',
    assumptions: [
      'A big water bottle holds about 1 liter.',
      'Compare each container with that bottle.',
    ],
    question: 'Does it hold more or less than 1 liter?',
    bins: [
      { id: 'less', label: 'Less than 1 liter', why: 'It holds less than a big water bottle.' },
      { id: 'more', label: 'More than 1 liter', why: 'It holds more than a big water bottle.' },
    ],
    cards: [
      { label: 'Spoon', bin: 'less' },
      { label: 'Cup', bin: 'less' },
      { label: 'Juice box', bin: 'less' },
      { label: 'Eyedropper', bin: 'less' },
      { label: 'Bathtub', bin: 'more' },
      { label: 'Bucket', bin: 'more' },
      { label: 'Fish tank', bin: 'more' },
      { label: 'Kitchen sink', bin: 'more' },
    ],
  },

  // ── Grade 4 ──
  {
    kind: 'sort',
    id: 'm.4.factors-multiples~prime-composite',
    title: 'Prime or composite?',
    use: 'Use this to sort numbers by how many factors they have.',
    assumptions: [
      'A prime number has exactly two factors: 1 and itself.',
      'A composite number has more than two factors.',
      '1 has only one factor, so it is neither.',
    ],
    question: 'How many factors does it have?',
    bins: [
      { id: 'prime', label: 'Prime', why: 'Exactly two factors: 1 and the number.' },
      { id: 'composite', label: 'Composite', why: 'More than two factors.' },
      { id: 'neither', label: 'Neither', why: '1 has only one factor.' },
    ],
    cards: [
      { label: '2', bin: 'prime' },
      { label: '7', bin: 'prime' },
      { label: '13', bin: 'prime' },
      { label: '29', bin: 'prime' },
      { label: '41', bin: 'prime' },
      { label: '9', bin: 'composite' },
      { label: '15', bin: 'composite' },
      { label: '21', bin: 'composite' },
      { label: '51', bin: 'composite' },
      { label: '57', bin: 'composite' },
      { label: '91', bin: 'composite' },
      { label: '1', bin: 'neither' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.4.fraction-equivalence~benchmark',
    title: 'Compare to one half',
    use: 'Use this to compare a fraction with 1/2.',
    assumptions: [
      'Half the denominator is one half: 4/8 is 1/2, and so is 5/10.',
      'A numerator more than half the denominator is more than 1/2.',
      'Each card shows the fraction over a bar of 1/2.',
    ],
    question: 'Is it less than, equal to, or more than 1/2?',
    bins: [
      {
        id: 'less',
        label: 'Less than 1/2',
        why: 'The numerator is less than half the denominator.',
      },
      { id: 'equal', label: 'Equal to 1/2', why: 'The numerator is half the denominator.' },
      {
        id: 'more',
        label: 'More than 1/2',
        why: 'The numerator is more than half the denominator.',
      },
    ],
    cards: [
      {
        label: '3/8',
        bin: 'less',
        figure: {
          kind: 'fractionBars',
          bars: [
            [3, 8],
            [1, 2],
          ],
        },
      },
      {
        label: '2/5',
        bin: 'less',
        figure: {
          kind: 'fractionBars',
          bars: [
            [2, 5],
            [1, 2],
          ],
        },
      },
      {
        label: '4/10',
        bin: 'less',
        figure: {
          kind: 'fractionBars',
          bars: [
            [4, 10],
            [1, 2],
          ],
        },
      },
      {
        label: '1/3',
        bin: 'less',
        figure: {
          kind: 'fractionBars',
          bars: [
            [1, 3],
            [1, 2],
          ],
        },
      },
      {
        label: '3/6',
        bin: 'equal',
        figure: {
          kind: 'fractionBars',
          bars: [
            [3, 6],
            [1, 2],
          ],
        },
      },
      {
        label: '5/10',
        bin: 'equal',
        figure: {
          kind: 'fractionBars',
          bars: [
            [5, 10],
            [1, 2],
          ],
        },
      },
      {
        label: '6/12',
        bin: 'equal',
        figure: {
          kind: 'fractionBars',
          bars: [
            [6, 12],
            [1, 2],
          ],
        },
      },
      {
        label: '5/8',
        bin: 'more',
        figure: {
          kind: 'fractionBars',
          bars: [
            [5, 8],
            [1, 2],
          ],
        },
      },
      {
        label: '3/5',
        bin: 'more',
        figure: {
          kind: 'fractionBars',
          bars: [
            [3, 5],
            [1, 2],
          ],
        },
      },
      {
        label: '7/12',
        bin: 'more',
        figure: {
          kind: 'fractionBars',
          bars: [
            [7, 12],
            [1, 2],
          ],
        },
      },
      {
        label: '2/3',
        bin: 'more',
        figure: {
          kind: 'fractionBars',
          bars: [
            [2, 3],
            [1, 2],
          ],
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.4.lines-symmetry',
    assumptions: [
      'Parallel lines go the same way and never meet, like railroad tracks.',
      'Perpendicular lines meet at a right angle, like the corner of a page.',
      'Lines that meet at any other angle are neither.',
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
      'A trapezoid has at least one pair of parallel sides (some books say exactly one).',
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
  {
    kind: 'sort',
    id: 'm.4.lines-symmetry~lines-rays',
    title: 'Points, lines, segments and rays',
    use: 'Use this to tell a point, a line, a line segment and a ray apart.',
    assumptions: [
      'A point is one exact spot.',
      'A line goes on forever both ways. A line segment has two endpoints.',
      'A ray has one endpoint and goes on forever one way.',
    ],
    question: 'What is it?',
    bins: [
      { id: 'point', label: 'Point', why: 'One exact spot.' },
      { id: 'line', label: 'Line', why: 'It goes on forever both ways.' },
      { id: 'segment', label: 'Line segment', why: 'It has two endpoints.' },
      { id: 'ray', label: 'Ray', why: 'One endpoint; it goes on forever one way.' },
    ],
    cards: [
      {
        label: 'A dot that marks one spot',
        bin: 'point',
        figure: { kind: 'ray', arrows: 0, point: true },
      },
      {
        label: 'The corner point of a square',
        bin: 'point',
        figure: { kind: 'ray', arrows: 0, point: true },
      },
      {
        label: 'A number line with arrows at both ends',
        bin: 'line',
        figure: { kind: 'ray', arrows: 2 },
      },
      {
        label: 'A straight path that never ends either way',
        bin: 'line',
        figure: { kind: 'ray', arrows: 2 },
      },
      { label: 'One side of a triangle', bin: 'segment', figure: { kind: 'ray', arrows: 0 } },
      { label: 'The edge of a ruler', bin: 'segment', figure: { kind: 'ray', arrows: 0 } },
      { label: 'A flashlight beam', bin: 'ray', figure: { kind: 'ray', arrows: 1 } },
      { label: 'Sunlight starting at the sun', bin: 'ray', figure: { kind: 'ray', arrows: 1 } },
    ],
  },
  {
    kind: 'sort',
    id: 'm.4.lines-symmetry~angle-types',
    title: 'Acute, right, obtuse and straight angles',
    use: 'Use this to sort angles by comparing them with a square corner.',
    assumptions: [
      'A right angle is a square corner: 90°.',
      'An acute angle is smaller than a right angle. An obtuse angle is bigger, but less than a straight line.',
      'A straight angle is a straight line: 180°.',
    ],
    question: 'Is the angle smaller than, equal to, or bigger than a square corner?',
    bins: [
      { id: 'acute', label: 'Acute', why: 'Smaller than a square corner.' },
      { id: 'right', label: 'Right', why: 'A square corner: 90°.' },
      {
        id: 'obtuse',
        label: 'Obtuse',
        why: 'Bigger than a square corner, less than a straight line.',
      },
      { id: 'straight', label: 'Straight', why: 'A straight line: 180°.' },
    ],
    cards: [
      {
        label: 'A corner of 30°',
        bin: 'acute',
        figure: {
          kind: 'polygon',
          points: [
            [95, 85],
            [50, 85],
            [89, 62],
          ],
          open: true,
        },
      },
      {
        label: 'A corner of 60°',
        bin: 'acute',
        figure: {
          kind: 'polygon',
          points: [
            [95, 85],
            [50, 85],
            [72, 46],
          ],
          open: true,
        },
      },
      {
        label: 'A square corner',
        bin: 'right',
        figure: {
          kind: 'polygon',
          points: [
            [95, 85],
            [50, 85],
            [50, 40],
          ],
          open: true,
        },
      },
      {
        label: 'A square corner, turned',
        bin: 'right',
        figure: {
          kind: 'polygon',
          points: [
            [90, 90],
            [50, 50],
            [10, 90],
          ],
          open: true,
        },
      },
      {
        label: 'A corner of 120°',
        bin: 'obtuse',
        figure: {
          kind: 'polygon',
          points: [
            [95, 85],
            [50, 85],
            [28, 46],
          ],
          open: true,
        },
      },
      {
        label: 'A corner of 150°',
        bin: 'obtuse',
        figure: {
          kind: 'polygon',
          points: [
            [95, 85],
            [50, 85],
            [11, 62],
          ],
          open: true,
        },
      },
      {
        label: 'A flat line through a point',
        bin: 'straight',
        figure: {
          kind: 'polygon',
          points: [
            [95, 85],
            [50, 85],
            [5, 85],
          ],
          open: true,
        },
      },
      {
        label: 'Clock hands at 1:00',
        bin: 'acute',
        figure: {
          kind: 'polygon',
          points: [
            [50, 10],
            [50, 50],
            [66, 22],
          ],
          open: true,
        },
      },
      {
        label: 'Clock hands at 3:00',
        bin: 'right',
        figure: {
          kind: 'polygon',
          points: [
            [50, 10],
            [50, 50],
            [82, 50],
          ],
          open: true,
        },
      },
      {
        label: 'Clock hands at 5:00',
        bin: 'obtuse',
        figure: {
          kind: 'polygon',
          points: [
            [50, 10],
            [50, 50],
            [66, 78],
          ],
          open: true,
        },
      },
      {
        label: 'Clock hands at 6:00',
        bin: 'straight',
        figure: {
          kind: 'polygon',
          points: [
            [50, 10],
            [50, 50],
            [50, 82],
          ],
          open: true,
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.5.order-of-operations~write-expression',
    title: 'Which expression says it?',
    use: 'Use this to match words to an expression with parentheses.',
    assumptions: [
      'Words like “the sum of” or “add first” need parentheses around the adding.',
      '“Twice” means 2 times. “3 less than” takes 3 away at the end.',
      'Without parentheses, multiply before you add.',
    ],
    question: 'Which expression says it?',
    bins: [
      { id: 'p1', label: '2 × (8 + 7)', why: 'Add first, then double.' },
      { id: 'p2', label: '8 × 7 + 2', why: 'Multiply first, then add 2.' },
      { id: 'p3', label: '2 × (8 + 7) − 3', why: 'Add, double, then take away 3.' },
    ],
    cards: [
      { label: 'Add 8 and 7, then double', bin: 'p1' },
      { label: 'Twice the sum of 8 and 7', bin: 'p1' },
      { label: 'Multiply 8 by 7, then add 2', bin: 'p2' },
      { label: '2 more than 8 times 7', bin: 'p2' },
      { label: 'Add 8 and 7, double it, then take away 3', bin: 'p3' },
      { label: '3 less than twice the sum of 8 and 7', bin: 'p3' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.5.add-fractions-unlike~benchmark',
    title: 'Is the sum more than 1?',
    use: 'Use this to estimate a sum of fractions before adding.',
    assumptions: [
      'Compare each fraction with 1/2: two fractions less than 1/2 add to less than 1.',
      'Two fractions more than 1/2 add to more than 1.',
      'A sum like 2/5 + 1/2 is less than 1: 2/5 is less than 1/2.',
    ],
    question: 'Is the sum less than 1, equal to 1, or more than 1?',
    bins: [
      { id: 'less', label: 'Less than 1', why: 'The two parts do not fill a whole.' },
      { id: 'equal', label: 'Equal to 1', why: 'The two parts make exactly one whole.' },
      { id: 'more', label: 'More than 1', why: 'The two parts fill a whole and more.' },
    ],
    cards: [
      { label: '2/5 + 1/2', bin: 'less' },
      { label: '1/3 + 1/4', bin: 'less' },
      { label: '1/8 + 3/4', bin: 'less' },
      { label: '2/3 + 1/3', bin: 'equal' },
      { label: '1/2 + 2/4', bin: 'equal' },
      { label: '3/8 + 5/8', bin: 'equal' },
      { label: '3/4 + 1/2', bin: 'more' },
      { label: '5/6 + 1/3', bin: 'more' },
      { label: '2/3 + 3/5', bin: 'more' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.5.multiply-fractions~scaling',
    title: 'Bigger or smaller?',
    use: 'Use this to tell whether a product is more or less than the number, without multiplying.',
    assumptions: [
      'Times a fraction less than 1 makes a number smaller.',
      'Times 1, or a fraction equal to 1, keeps it the same.',
      'Times a number more than 1 makes it bigger.',
    ],
    question: 'Is the product less than 12, equal to 12, or more than 12?',
    bins: [
      { id: 'less', label: 'Less than 12', why: 'Times a fraction less than 1 makes it smaller.' },
      { id: 'equal', label: 'Equal to 12', why: 'Times 1 keeps it the same.' },
      { id: 'more', label: 'More than 12', why: 'Times more than 1 makes it bigger.' },
    ],
    cards: [
      { label: '12 × 3/4', bin: 'less' },
      { label: '7/8 × 12', bin: 'less' },
      { label: '12 × 1/2', bin: 'less' },
      { label: '12 × 1', bin: 'equal' },
      { label: '12 × 4/4', bin: 'equal' },
      { label: '12 × 5/4', bin: 'more' },
      { label: '1 1/2 × 12', bin: 'more' },
      { label: '12 × 3', bin: 'more' },
    ],
  },
  // ── Grade 5: classify two-dimensional figures in a hierarchy (5.G.3, 5.G.4) ──
  {
    kind: 'sort',
    id: 'm.5.classify-2d',
    assumptions: [
      'A trapezoid has at least one pair of parallel sides, so every parallelogram is a trapezoid too.',
      'A parallelogram has two pairs of parallel sides. A rectangle is a parallelogram with four right angles. A rhombus has four equal sides.',
      'A square is both: four right angles and four equal sides. Give the most exact name.',
      'Some books say a trapezoid has exactly one pair. Then a parallelogram is not a trapezoid.',
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
        label: 'Trapezoid, not a parallelogram',
        why: 'One pair of parallel sides; the other two sides are not parallel.',
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
            [35, 24],
            [95, 24],
            [65, 76],
            [5, 76],
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
      'Some books count an equilateral triangle as isosceles too: it has at least two equal sides.',
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
  {
    kind: 'sort',
    id: 'm.5.classify-2d~by-angles',
    title: 'Sort triangles by their angles',
    use: 'Use this to name a triangle as acute, right or obtuse.',
    assumptions: [
      'A right angle is a square corner. An acute angle is smaller, an obtuse angle is bigger.',
      'A right triangle has one right angle. An obtuse triangle has one obtuse angle.',
      'An acute triangle has three acute angles. A triangle can have only one angle that is not acute.',
    ],
    question: 'What is its biggest angle: smaller than, equal to, or bigger than a square corner?',
    bins: [
      {
        id: 'acute',
        label: 'Acute: all angles small',
        why: 'Every corner is smaller than a square corner.',
      },
      {
        id: 'right',
        label: 'Right: one square corner',
        why: 'One corner is exactly a square corner.',
      },
      {
        id: 'obtuse',
        label: 'Obtuse: one wide angle',
        why: 'One corner is wider than a square corner.',
      },
    ],
    cards: [
      {
        label: 'Angles 60°, 60°, 60°',
        bin: 'acute',
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
        label: 'Angles 90°, 45°, 45°',
        bin: 'right',
        figure: {
          kind: 'polygon',
          points: [
            [15, 85],
            [85, 85],
            [15, 15],
          ],
        },
      },
      {
        label: 'Angles 120°, 30°, 30°',
        bin: 'obtuse',
        figure: {
          kind: 'polygon',
          points: [
            [5, 80],
            [95, 80],
            [50, 55],
          ],
        },
      },
      {
        label: 'Angles 90°, 60°, 30°',
        bin: 'right',
        figure: {
          kind: 'polygon',
          points: [
            [10, 85],
            [90, 85],
            [10, 40],
          ],
        },
      },
      {
        label: 'Angles 80°, 60°, 40°',
        bin: 'acute',
        figure: {
          kind: 'polygon',
          points: [
            [5, 85],
            [95, 85],
            [40, 20],
          ],
        },
      },
      {
        label: 'Angles 100°, 50°, 30°',
        bin: 'obtuse',
        figure: {
          kind: 'polygon',
          points: [
            [5, 80],
            [95, 80],
            [25, 45],
          ],
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.5.classify-2d~always-sometimes-never',
    title: 'Always, sometimes or never?',
    use: 'Use this to decide whether a sentence about shapes is always true.',
    assumptions: [
      'Always: every shape in the first group belongs to the second.',
      'Sometimes: some do and some do not.',
      'Never: none do.',
      'A trapezoid has at least one pair of parallel sides, so a parallelogram counts as one.',
    ],
    question: 'Is it always, sometimes, or never true?',
    bins: [
      { id: 'always', label: 'Always', why: 'Every one of them fits.' },
      { id: 'sometimes', label: 'Sometimes', why: 'Some fit and some do not.' },
      { id: 'never', label: 'Never', why: 'None of them fit.' },
    ],
    cards: [
      { label: 'A square is a rectangle', bin: 'always' },
      { label: 'A rhombus is a parallelogram', bin: 'always' },
      { label: 'A rectangle is a parallelogram', bin: 'always' },
      { label: 'A rectangle is a square', bin: 'sometimes' },
      { label: 'A parallelogram is a rhombus', bin: 'sometimes' },
      { label: 'A rhombus is a square', bin: 'sometimes' },
      { label: 'A parallelogram is a trapezoid', bin: 'always' },
      { label: 'A trapezoid is a parallelogram', bin: 'sometimes' },
      { label: 'A triangle is a quadrilateral', bin: 'never' },
      { label: 'A square has a side longer than another side', bin: 'never' },
    ],
  },
  // ── Grade 6 ──
  {
    kind: 'sort',
    id: 'm.6.ratios~language',
    title: 'Ratio language',
    use: 'Use this to match words like “for every” and “to” with the ratio they describe.',
    assumptions: [
      'A shelter has 2 cats and 3 dogs, so 5 animals in all.',
      'The order of the words is the order of the numbers: cats to dogs is 2:3.',
      'A ratio can compare a part with the whole: cats to all the animals is 2:5.',
    ],
    question: 'A shelter has 2 cats and 3 dogs. Which ratio does it describe?',
    bins: [
      { id: '2:3', label: '2:3', why: 'Cats to dogs: 2 cats for every 3 dogs.' },
      { id: '3:2', label: '3:2', why: 'Dogs to cats: 3 dogs for every 2 cats.' },
      { id: '2:5', label: '2:5', why: 'Cats to all the animals: 2 of every 5.' },
      { id: '3:5', label: '3:5', why: 'Dogs to all the animals: 3 of every 5.' },
    ],
    cards: [
      { label: 'For every 2 cats there are 3 dogs', bin: '2:3' },
      { label: '4 cats for every 6 dogs', bin: '2:3' },
      { label: 'There are 3 dogs for every 2 cats', bin: '3:2' },
      { label: 'The ratio of dogs to cats', bin: '3:2' },
      { label: '2 of every 5 animals are cats', bin: '2:5' },
      { label: 'Cats to all the animals', bin: '2:5' },
      { label: 'Dogs to all the animals', bin: '3:5' },
      { label: '9 dogs out of 15 animals', bin: '3:5' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.ratios~equivalent',
    title: 'Equivalent ratios',
    use: 'Use this to tell whether a ratio is equivalent to 2:3.',
    assumptions: [
      'Equivalent ratios multiply (or divide) both parts by the same number.',
      'Adding the same number to both parts changes the ratio: 2:3 and 3:4 are not equivalent.',
      'The order matters: 3:2 is not 2:3.',
    ],
    question: 'Is it equivalent to 2:3?',
    bins: [
      { id: 'yes', label: 'Equivalent', why: 'Both parts were multiplied by the same number.' },
      {
        id: 'no',
        label: 'Not equivalent',
        why: 'The parts were not multiplied by the same number, or the order changed.',
      },
    ],
    cards: [
      { label: '4:6', bin: 'yes' },
      { label: '10:15', bin: 'yes' },
      { label: '6:9', bin: 'yes' },
      { label: '1:1.5', bin: 'yes' },
      { label: '20:30', bin: 'yes' },
      { label: '3:4', bin: 'no' },
      { label: '5:6', bin: 'no' },
      { label: '3:2', bin: 'no' },
      { label: '4:9', bin: 'no' },
      { label: '12:13', bin: 'no' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.percent~benchmarks',
    title: 'Benchmark percents',
    use: 'Use this to match fractions, decimals and “out of” with 10%, 25%, 50%, 75% and 100%.',
    assumptions: [
      'Percent means out of 100: 25% is 25/100 = 1/4.',
      '“5 out of 20” is the fraction 5/20, which is 1/4.',
      'The whole is 100%.',
    ],
    question: 'Which percent is it?',
    bins: [
      { id: '10', label: '10%', why: 'One tenth: 10 out of 100.' },
      { id: '25', label: '25%', why: 'One quarter: 25 out of 100.' },
      { id: '50', label: '50%', why: 'One half: 50 out of 100.' },
      { id: '75', label: '75%', why: 'Three quarters: 75 out of 100.' },
      { id: '100', label: '100%', why: 'The whole: all of it.' },
    ],
    cards: [
      { label: '1/10', bin: '10' },
      { label: '0.1', bin: '10' },
      { label: '4 out of 40', bin: '10' },
      { label: '1/4', bin: '25' },
      { label: '0.25', bin: '25' },
      { label: '5 out of 20', bin: '25' },
      { label: '1/2', bin: '50' },
      { label: '0.5', bin: '50' },
      { label: '30 out of 60', bin: '50' },
      { label: '3/4', bin: '75' },
      { label: '0.75', bin: '75' },
      { label: '15 out of 20', bin: '75' },
      { label: '1', bin: '100' },
      { label: '8 out of 8', bin: '100' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.divide-fractions~bigger-or-smaller',
    title: 'Bigger or smaller quotient?',
    use: 'Use this to tell, before dividing, whether 6 ÷ a fraction is more or less than 6.',
    assumptions: [
      'Dividing by a number less than 1 gives more: more groups fit.',
      'Dividing by 1 changes nothing.',
      'Dividing by a number more than 1 gives less.',
    ],
    question: 'Is the quotient more than 6, equal to 6, or less than 6?',
    bins: [
      { id: 'more', label: 'More than 6', why: 'Dividing by a number less than 1 gives more.' },
      { id: 'equal', label: 'Equal to 6', why: 'Dividing by 1 leaves the number the same.' },
      { id: 'less', label: 'Less than 6', why: 'Dividing by a number more than 1 gives less.' },
    ],
    cards: [
      { label: '6 ÷ 1/2', bin: 'more' },
      { label: '6 ÷ 2/3', bin: 'more' },
      { label: '6 ÷ 3/4', bin: 'more' },
      { label: '6 ÷ 0.5', bin: 'more' },
      { label: '6 ÷ 1', bin: 'equal' },
      { label: '6 ÷ 4/4', bin: 'equal' },
      { label: '6 ÷ 3/2', bin: 'less' },
      { label: '6 ÷ 2', bin: 'less' },
      { label: '6 ÷ 5/4', bin: 'less' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.gcf-lcm~gcf-or-lcm',
    title: 'GCF or LCM?',
    use: 'Use this to decide whether a word problem needs the GCF or the LCM.',
    assumptions: [
      'The GCF splits things into equal groups with nothing left over.',
      'The LCM finds when two repeating things happen together again.',
      'Ask: am I splitting into groups, or waiting for things to line up?',
    ],
    question: 'Which do you need?',
    bins: [
      {
        id: 'gcf',
        label: 'GCF',
        why: 'Split things into the most equal groups, or cut the longest equal pieces.',
      },
      { id: 'lcm', label: 'LCM', why: 'Find when two repeating things line up again.' },
    ],
    cards: [
      {
        label: 'Make identical snack bags from 24 apples and 36 crackers, as many bags as you can',
        bin: 'gcf',
      },
      {
        label: 'Cut ribbons of 18 cm and 30 cm into the longest equal pieces, none left over',
        bin: 'gcf',
      },
      {
        label: 'Split 40 boys and 32 girls into teams with the same mix, as many teams as you can',
        bin: 'gcf',
      },
      {
        label: 'Set 48 red and 60 blue chairs in equal rows of one color, the most chairs per row',
        bin: 'gcf',
      },
      {
        label: 'Hot dogs come 10 to a pack and buns 8 to a pack; buy the fewest so none are left',
        bin: 'lcm',
      },
      { label: 'Two lights blink every 6 and 8 seconds; when do they blink together?', bin: 'lcm' },
      {
        label: 'A bus comes every 12 minutes and a train every 15; when do both come?',
        bin: 'lcm',
      },
      { label: 'Stack 4 cm and 6 cm blocks in two towers to the lowest equal height', bin: 'lcm' },
    ],
  },
  {
    kind: 'sequence',
    id: 'm.6.integers~order',
    title: 'Order rational numbers',
    use: 'Use this to put negative numbers, fractions and absolute values in order.',
    assumptions: [
      'Further left on the number line is less: −6 < −1.',
      'Every negative number is less than 0, and 0 is less than every positive number.',
      '|−5| is 5: its distance from 0.',
    ],
    question: 'Put the numbers in order from least to greatest.',
    stages: [
      { label: '−6' },
      { label: '−2 1/2' },
      { label: '−1' },
      { label: '0' },
      { label: '3/4' },
      { label: '2' },
      { label: '|−5|' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.integers~meaning',
    title: 'Positive, negative or zero?',
    use: 'Use this to match everyday amounts with positive and negative numbers.',
    assumptions: [
      'Positive and negative numbers name opposite directions: above and below, gain and loss.',
      'Zero is the starting point: sea level, 0 °C, nothing owed.',
      'A debt of $30 is −30 dollars in the account.',
    ],
    question: 'Positive, negative or zero?',
    bins: [
      { id: 'pos', label: 'Positive', why: 'Above zero: a gain, a deposit, a height.' },
      { id: 'neg', label: 'Negative', why: 'Below zero: a loss, a debt, a depth.' },
      { id: 'zero', label: 'Zero', why: 'The starting point: neither up nor down.' },
    ],
    cards: [
      { label: 'A deposit of $50', bin: 'pos' },
      { label: '5 degrees above zero', bin: 'pos' },
      { label: 'A gain of 12 points', bin: 'pos' },
      { label: 'A plane 300 m above sea level', bin: 'pos' },
      { label: 'A dive 20 m below sea level', bin: 'neg' },
      { label: 'A debt of $30', bin: 'neg' },
      { label: 'A loss of 8 yards', bin: 'neg' },
      { label: 'A withdrawal of $15', bin: 'neg' },
      { label: 'Sea level', bin: 'zero' },
      { label: 'The temperature water freezes at, in °C', bin: 'zero' },
      { label: 'No money owed and none saved', bin: 'zero' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.coordinate-plane-4q~quadrant',
    title: 'Which quadrant?',
    use: 'Use this to place a point in a quadrant from the signs of its coordinates.',
    assumptions: [
      'The first coordinate says left or right; the second says up or down.',
      'The quadrants go counterclockwise from the top right: I, II, III, IV.',
      'A point with a 0 coordinate is on an axis, not in a quadrant.',
    ],
    question: 'Where is the point?',
    bins: [
      { id: 'I', label: 'Quadrant I (+, +)', why: 'Right of the y-axis and above the x-axis.' },
      { id: 'II', label: 'Quadrant II (−, +)', why: 'Left of the y-axis and above the x-axis.' },
      { id: 'III', label: 'Quadrant III (−, −)', why: 'Left of the y-axis and below the x-axis.' },
      { id: 'IV', label: 'Quadrant IV (+, −)', why: 'Right of the y-axis and below the x-axis.' },
      { id: 'axis', label: 'On an axis', why: 'One coordinate is 0.' },
    ],
    cards: [
      { label: '(3, 5)', bin: 'I' },
      { label: '(1.5, 2.5)', bin: 'I' },
      { label: '(−2, 4)', bin: 'II' },
      { label: '(−0.5, 2)', bin: 'II' },
      { label: '(−6, −1)', bin: 'III' },
      { label: '(−3, −3)', bin: 'III' },
      { label: '(4, −3)', bin: 'IV' },
      { label: '(7, −7)', bin: 'IV' },
      { label: '(0, −5)', bin: 'axis' },
      { label: '(5, 0)', bin: 'axis' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.expressions-variables~words',
    title: 'Words to expressions',
    use: 'Use this to write phrases like “5 less than a number” as expressions.',
    assumptions: [
      'The letter x stands for the number.',
      '“5 less than a number” starts with the number: x − 5.',
      '5x means 5 × x.',
    ],
    question: 'Which expression says it?',
    bins: [
      { id: 'add', label: 'x + 5', why: 'Adds 5 to the number.' },
      { id: 'times', label: '5x', why: 'Multiplies the number by 5.' },
      { id: 'less', label: 'x − 5', why: 'Takes 5 away from the number.' },
      { id: 'from', label: '5 − x', why: 'Takes the number away from 5.' },
      { id: 'div', label: 'x ÷ 5', why: 'Divides the number into 5 equal parts.' },
    ],
    cards: [
      { label: '5 more than a number', bin: 'add' },
      { label: 'A number increased by 5', bin: 'add' },
      { label: 'The product of 5 and a number', bin: 'times' },
      { label: '5 times a number', bin: 'times' },
      { label: '5 less than a number', bin: 'less' },
      { label: 'A number decreased by 5', bin: 'less' },
      { label: '5 fewer than a number', bin: 'less' },
      { label: '5 minus a number', bin: 'from' },
      { label: 'A number taken away from 5', bin: 'from' },
      { label: 'A number divided by 5', bin: 'div' },
      { label: 'A number shared equally by 5 people', bin: 'div' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.expressions-variables~parts',
    title: 'Parts of an expression',
    use: 'Use this to name the coefficient, the constant and the variable in an expression.',
    assumptions: [
      'The variable is the letter.',
      'The coefficient is the number multiplying the letter: the 4 in 4x.',
      'The constant is a number on its own: the 7 in 4x + 7.',
    ],
    question: 'In each expression, what is it?',
    bins: [
      { id: 'coef', label: 'Coefficient', why: 'The number that multiplies the variable.' },
      { id: 'const', label: 'Constant', why: 'A number that stays the same on its own.' },
      { id: 'var', label: 'Variable', why: 'The letter that stands for a number.' },
    ],
    cards: [
      { label: 'the 4 in 4x + 7', bin: 'coef' },
      { label: 'the 2 in 9 + 2y', bin: 'coef' },
      { label: 'the 7 in 4x + 7', bin: 'const' },
      { label: 'the 9 in 9 + 2y', bin: 'const' },
      { label: 'the 3 in m + 3', bin: 'const' },
      { label: 'the x in 4x + 7', bin: 'var' },
      { label: 'the y in 9 + 2y', bin: 'var' },
      { label: 'the m in m + 3', bin: 'var' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.one-step-equations~write-equation',
    title: 'Equations from stories',
    use: 'Use this to match a story with the equation that fits it.',
    assumptions: [
      'The letter x stands for the number the story doesn’t tell you.',
      '“More” and “rose by” add; “equal pieces” and “times” multiply; “gave away” subtracts.',
      'Check: put your answer back in the story.',
    ],
    question: 'Which equation fits the story?',
    bins: [
      { id: 'add', label: 'x + 12 = 30', why: 'Something unknown, then 12 more, makes 30.' },
      { id: 'times', label: '12x = 30', why: '12 equal groups of the unknown make 30.' },
      { id: 'sub', label: 'x − 12 = 30', why: 'The unknown, less 12, leaves 30.' },
    ],
    cards: [
      { label: 'Mia had some stickers, got 12 more, and now has 30', bin: 'add' },
      { label: 'The price rose by $12 to $30', bin: 'add' },
      { label: '12 more than a number is 30', bin: 'add' },
      { label: '12 equal boxes weigh 30 kg in all', bin: 'times' },
      { label: 'A 30 m rope is cut into 12 equal pieces', bin: 'times' },
      { label: '12 times a number is 30', bin: 'times' },
      { label: 'After giving away 12 cards she has 30', bin: 'sub' },
      { label: 'He spent $12 and has $30 left', bin: 'sub' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.one-step-equations~inequality',
    title: 'Inequalities',
    use: 'Use this to match words and number-line graphs with x > 3, x ≥ 3, x < 3 and x ≤ 3.',
    assumptions: [
      'An open circle leaves 3 out; a closed (filled) circle takes 3 in.',
      '“At least 3” includes 3; “more than 3” does not.',
      'An inequality has many solutions: every number on the arrow.',
    ],
    question: 'Which inequality?',
    bins: [
      { id: 'gt', label: 'x > 3', why: 'More than 3: 3 is not included.' },
      { id: 'ge', label: 'x ≥ 3', why: '3 or more: 3 is included.' },
      { id: 'lt', label: 'x < 3', why: 'Less than 3: 3 is not included.' },
      { id: 'le', label: 'x ≤ 3', why: '3 or less: 3 is included.' },
    ],
    cards: [
      { label: 'More than 3', bin: 'gt' },
      {
        label: 'Open circle at 3, arrow right',
        bin: 'gt',
        figure: { kind: 'inequality', at: 3, dir: 'right', closed: false },
      },
      { label: 'At least 3', bin: 'ge' },
      { label: '3 or more', bin: 'ge' },
      { label: 'No less than 3', bin: 'ge' },
      {
        label: 'Closed circle at 3, arrow right',
        bin: 'ge',
        figure: { kind: 'inequality', at: 3, dir: 'right', closed: true },
      },
      { label: 'Fewer than 3', bin: 'lt' },
      { label: 'Less than 3', bin: 'lt' },
      {
        label: 'Open circle at 3, arrow left',
        bin: 'lt',
        figure: { kind: 'inequality', at: 3, dir: 'left', closed: false },
      },
      { label: 'At most 3', bin: 'le' },
      { label: 'No more than 3', bin: 'le' },
      {
        label: 'Closed circle at 3, arrow left',
        bin: 'le',
        figure: { kind: 'inequality', at: 3, dir: 'left', closed: true },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.area-polygons~height',
    title: 'Which segment is a height?',
    use: 'Use this to find the height that goes with a base, even outside the shape.',
    assumptions: [
      'A height meets the base (or its line) at a square corner.',
      'In an obtuse triangle the height can fall outside: extend the base to meet it.',
      'A slanted side is not a height.',
    ],
    question: 'Is the dashed segment a height for the thick base?',
    bins: [
      { id: 'yes', label: 'A height', why: 'It meets the base’s line at a square corner.' },
      {
        id: 'no',
        label: 'Not a height',
        why: 'It is slanted: it doesn’t meet the base at a square corner.',
      },
    ],
    cards: [
      {
        label: 'Triangle: top corner straight down to the base',
        bin: 'yes',
        figure: {
          kind: 'polygon',
          points: [
            [10, 85],
            [90, 85],
            [45, 15],
          ],
          base: 0,
          dashed: [
            [45, 15],
            [45, 85],
          ],
        },
      },
      {
        label: 'Obtuse triangle: height outside, base extended',
        bin: 'yes',
        figure: {
          kind: 'polygon',
          points: [
            [40, 85],
            [90, 85],
            [12, 20],
          ],
          base: 0,
          dashed: [
            [12, 20],
            [12, 85],
          ],
          extend: true,
        },
      },
      {
        label: 'Right triangle: the upright side',
        bin: 'yes',
        figure: {
          kind: 'polygon',
          points: [
            [15, 85],
            [85, 85],
            [15, 20],
          ],
          base: 0,
          dashed: [
            [15, 20],
            [15, 85],
          ],
        },
      },
      {
        label: 'Parallelogram: straight across between the parallel sides',
        bin: 'yes',
        figure: {
          kind: 'polygon',
          points: [
            [10, 80],
            [70, 80],
            [90, 25],
            [30, 25],
          ],
          base: 0,
          dashed: [
            [50, 25],
            [50, 80],
          ],
        },
      },
      {
        label: 'Triangle: top corner to the middle of a slanted side',
        bin: 'no',
        figure: {
          kind: 'polygon',
          points: [
            [10, 85],
            [90, 85],
            [60, 15],
          ],
          base: 0,
          dashed: [
            [60, 15],
            [50, 85],
          ],
        },
      },
      {
        label: 'Parallelogram: the slanted side',
        bin: 'no',
        figure: {
          kind: 'polygon',
          points: [
            [10, 80],
            [70, 80],
            [90, 25],
            [30, 25],
          ],
          base: 0,
          dashed: [
            [10, 80],
            [30, 25],
          ],
        },
      },
      {
        label: 'Trapezoid: the slanted side',
        bin: 'no',
        figure: {
          kind: 'polygon',
          points: [
            [10, 80],
            [90, 80],
            [65, 25],
            [30, 25],
          ],
          base: 0,
          dashed: [
            [90, 80],
            [65, 25],
          ],
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.surface-area-nets~which-net',
    title: 'Which nets fold into a cube?',
    use: 'Use this to tell whether six squares fold into a cube.',
    assumptions: [
      'A cube has 6 faces, so its net has 6 squares.',
      'Picture folding: two squares may not land on the same face.',
      'A row of 5 or more squares, or a 2 × 3 block, never folds into a cube.',
    ],
    question: 'Does it fold into a cube?',
    bins: [
      { id: 'yes', label: 'Folds into a cube', why: 'Every square lands on a different face.' },
      {
        id: 'no',
        label: 'Doesn’t fold',
        why: 'Two squares land on the same face, leaving one face open.',
      },
    ],
    cards: [
      {
        label: 'A cross',
        bin: 'yes',
        figure: {
          kind: 'net',
          cells: [
            [1, 0],
            [0, 1],
            [1, 1],
            [2, 1],
            [3, 1],
            [1, 2],
          ],
        },
      },
      {
        label: 'A row of 4, one above the first and one below the last',
        bin: 'yes',
        figure: {
          kind: 'net',
          cells: [
            [0, 0],
            [0, 1],
            [1, 1],
            [2, 1],
            [3, 1],
            [3, 2],
          ],
        },
      },
      {
        label: 'A row of 4, one above the first and one below the third',
        bin: 'yes',
        figure: {
          kind: 'net',
          cells: [
            [0, 0],
            [0, 1],
            [1, 1],
            [2, 1],
            [3, 1],
            [2, 2],
          ],
        },
      },
      {
        label: 'A staircase',
        bin: 'yes',
        figure: {
          kind: 'net',
          cells: [
            [0, 0],
            [1, 0],
            [1, 1],
            [2, 1],
            [2, 2],
            [3, 2],
          ],
        },
      },
      {
        label: 'Two rows of 3 that touch at one square',
        bin: 'yes',
        figure: {
          kind: 'net',
          cells: [
            [0, 0],
            [1, 0],
            [2, 0],
            [2, 1],
            [3, 1],
            [4, 1],
          ],
        },
      },
      {
        label: 'A 2 × 3 block',
        bin: 'no',
        figure: {
          kind: 'net',
          cells: [
            [0, 0],
            [1, 0],
            [2, 0],
            [0, 1],
            [1, 1],
            [2, 1],
          ],
        },
      },
      {
        label: 'A row of 6',
        bin: 'no',
        figure: {
          kind: 'net',
          cells: [
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 0],
            [5, 0],
          ],
        },
      },
      {
        label: 'A square of 4 with two more',
        bin: 'no',
        figure: {
          kind: 'net',
          cells: [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [2, 1],
            [3, 1],
          ],
        },
      },
      {
        label: 'A row of 5 and one more',
        bin: 'no',
        figure: {
          kind: 'net',
          cells: [
            [0, 0],
            [0, 1],
            [1, 1],
            [2, 1],
            [3, 1],
            [4, 1],
          ],
        },
      },
      {
        label: 'A row of 4 with two stacked above one square',
        bin: 'no',
        figure: {
          kind: 'net',
          cells: [
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
            [1, 1],
            [1, 2],
          ],
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.center-spread~statistical-questions',
    title: 'Statistical questions',
    use: 'Use this to tell a statistical question from a question with one answer.',
    assumptions: [
      'A statistical question expects answers that vary.',
      'You answer it by collecting data from many people or things.',
      'A question about one person or one fact has one answer.',
    ],
    question: 'Is it a statistical question?',
    bins: [
      { id: 'yes', label: 'Statistical', why: 'The answers vary, so you collect data.' },
      { id: 'no', label: 'Not statistical', why: 'It has one answer.' },
    ],
    cards: [
      { label: 'How tall are the students in my class?', bin: 'yes' },
      { label: 'How many pets do families on my street have?', bin: 'yes' },
      { label: 'How long do my classmates take to get to school?', bin: 'yes' },
      { label: 'How many hours did each sixth grader sleep last night?', bin: 'yes' },
      { label: 'How tall is Maya?', bin: 'no' },
      { label: 'How many days are in May?', bin: 'no' },
      { label: 'What time does school start?', bin: 'no' },
      { label: 'How much does this apple weigh?', bin: 'no' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.6.center-spread~mean-or-median',
    title: 'Mean or median?',
    use: 'Use this to choose the mean or the median to describe the center of a set of data.',
    assumptions: [
      'An outlier is a value far from the rest.',
      'An outlier pulls the mean toward it; the median barely moves.',
      'With balanced data and no outliers, the mean works well.',
    ],
    question: 'Which describes the center better?',
    bins: [
      { id: 'median', label: 'The median', why: 'An outlier or a long tail pulls the mean.' },
      { id: 'mean', label: 'The mean works', why: 'The data is balanced, with no outliers.' },
    ],
    cards: [
      { label: '2, 3, 3, 4, 40', bin: 'median' },
      { label: '1, 50, 52, 53, 55', bin: 'median' },
      { label: 'Homework minutes: 20, 25, 30, 25, 180', bin: 'median' },
      { label: 'Pay at a shop where the owner earns ten times what the rest do', bin: 'median' },
      { label: '10, 11, 12, 13, 14', bin: 'mean' },
      { label: 'Heights: 150, 152, 151, 153, 149 cm', bin: 'mean' },
      { label: 'Highs: 21, 22, 20, 23, 22 °C', bin: 'mean' },
    ],
  },
  {
    kind: 'observe',
    id: 'm.6.center-spread~histogram',
    title: 'Histograms',
    use: 'Use this to read how data spreads across equal intervals.',
    assumptions: [
      'Each bar counts the students whose time to get to school, in minutes, falls in that interval.',
      'The intervals are the same width and don’t overlap.',
      'Change the bars to see where most of the data is.',
    ],
    histogram: true,
    columns: ['0–9', '10–19', '20–29', '30–39', '40–49'],
    rowLabel: 'Students',
    unit: 'students',
    max: 12,
    step: 1,
    initial: [2, 5, 8, 4, 1],
    pattern: (values) => {
      const cols = ['0–9', '10–19', '20–29', '30–39', '40–49'];
      const total = values.reduce((s, x) => s + x, 0);
      const most = Math.max(...values);
      const where = cols.filter((_, i) => values[i] === most);
      if (total === 0) return 'No students yet: raise a bar.';
      return `Most students (${most}) are in ${where.join(' and ')} minutes. ${total} students in all.`;
    },
  },
];
