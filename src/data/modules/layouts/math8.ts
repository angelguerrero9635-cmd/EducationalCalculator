/**
 * Grade 8 math layout pages (sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../math/8.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

export const MATH_8_LAYOUTS: LayoutDef[] = [
  // ── Roots and irrational numbers (8.NS.1) ──
  {
    kind: 'sort',
    id: 'm.8.roots-irrationals~rational-or-not',
    title: 'Rational or irrational?',
    use: 'Use this for “Which of these numbers are irrational: −13/3, 0.1234, √37, −√100?”',
    assumptions: [
      'A rational number is a fraction of whole numbers (or its opposite). Its decimal ends or repeats.',
      'The square root of a perfect square is whole, so it is rational: √100 = 10.',
      'The square root of any other whole number is irrational, and so is π.',
    ],
    question: 'Is the number rational or irrational?',
    bins: [
      {
        id: 'rational',
        label: 'Rational',
        why: 'It can be written as a fraction of whole numbers; its decimal ends or repeats.',
      },
      {
        id: 'irrational',
        label: 'Irrational',
        why: 'Its decimal never ends or repeats: a root that is not whole, or π.',
      },
    ],
    cards: [
      { label: '−13/3', bin: 'rational' },
      { label: '0.1234', bin: 'rational' },
      { label: '−77', bin: 'rational' },
      { label: '−√100', bin: 'rational' },
      { label: '0.333…', bin: 'rational' },
      { label: '∛27', bin: 'rational' },
      { label: '19/2', bin: 'rational' },
      { label: '√37', bin: 'irrational' },
      { label: '−√12', bin: 'irrational' },
      { label: 'π', bin: 'irrational' },
      { label: '√2', bin: 'irrational' },
      { label: '∛530', bin: 'irrational' },
    ],
  },

  // ── Exponent rules (8.EE.1) ──
  {
    kind: 'sort',
    id: 'm.8.exponent-rules~true-or-false',
    title: 'True or false?',
    use: 'Use this for “Is 2⁸ · 2⁹ = 2¹⁷ true?” or “Which equations are true?”',
    assumptions: [
      'Same base, multiplied: add the exponents. Divided: subtract them.',
      'A power of a power multiplies the exponents.',
      'Same exponent, different bases: multiply the bases (8² · 9² = 72²).',
      'b⁰ = 1, and b⁻ⁿ = 1 ÷ bⁿ.',
    ],
    question: 'Is the equation true?',
    bins: [
      { id: 'true', label: 'True', why: 'An exponent rule makes both sides equal.' },
      { id: 'false', label: 'False', why: 'The two sides are different numbers.' },
    ],
    cards: [
      { label: '2⁸ · 2⁹ = 2¹⁷', bin: 'true' },
      { label: '8² · 9² = 72²', bin: 'true' },
      { label: '(3²)⁵ = 3¹⁰', bin: 'true' },
      { label: '3⁻² = 1/9', bin: 'true' },
      { label: '10 · 10⁴ = 10⁵', bin: 'true' },
      { label: '8² · 9² = 72⁴', bin: 'false' },
      { label: '2⁸ · 2⁹ = 4¹⁷', bin: 'false' },
      { label: '2⁴ · 3² = 6⁶', bin: 'false' },
      { label: '10⁶ ÷ 10² = 10³', bin: 'false' },
      { label: '5⁰ = 0', bin: 'false' },
    ],
  },

  // ── Scientific notation (8.EE.3) ──
  {
    kind: 'sort',
    id: 'm.8.scientific-notation~names',
    title: 'Powers of ten by name',
    use: 'Use this for “Match 1,000,000 to one million and to a power of ten.”',
    assumptions: [
      'Each power of ten is ten times the one before: 10⁶ is 1 followed by 6 zeros.',
      'A negative power is one over the power: 10⁻³ = 1/1,000 = 0.001.',
    ],
    question: 'Which power of ten is it?',
    bins: [
      { id: '6', label: '10⁶', why: 'One million.' },
      { id: '9', label: '10⁹', why: 'One billion.' },
      { id: '-2', label: '10⁻²', why: 'One hundredth.' },
      { id: '-3', label: '10⁻³', why: 'One thousandth.' },
      { id: '-6', label: '10⁻⁶', why: 'One millionth.' },
    ],
    cards: [
      { label: '1,000,000', bin: '6' },
      { label: 'one million', bin: '6' },
      { label: '1,000,000,000', bin: '9' },
      { label: 'one billion', bin: '9' },
      { label: '0.01', bin: '-2' },
      { label: 'one hundredth', bin: '-2' },
      { label: '0.001', bin: '-3' },
      { label: 'one thousandth', bin: '-3' },
      { label: '0.000001', bin: '-6' },
      { label: 'one millionth', bin: '-6' },
    ],
  },

  // ── Slope (8.EE.6, 8.F.4) ──
  {
    kind: 'sort',
    id: 'm.8.slope~sign',
    title: 'The signs of the slope and intercept',
    use: 'Use this for “Which line rises to the right and crosses the y-axis below 0?”',
    assumptions: [
      'In y = mx + b, m is the slope and b the y-intercept.',
      'A positive slope rises to the right; a negative one falls; a zero slope is flat.',
      'The intercept is where the line crosses the y-axis: above 0 or below it.',
    ],
    question: 'What are the slope and intercept of the line?',
    bins: [
      { id: '++', label: 'Slope +, intercept +', why: 'Rises to the right, crosses above 0.' },
      { id: '+-', label: 'Slope +, intercept −', why: 'Rises to the right, crosses below 0.' },
      { id: '-+', label: 'Slope −, intercept +', why: 'Falls to the right, crosses above 0.' },
      { id: '--', label: 'Slope −, intercept −', why: 'Falls to the right, crosses below 0.' },
      { id: '0', label: 'Zero slope', why: 'A flat line: y is the same for every x.' },
    ],
    cards: [
      { label: 'y = 2x + 3', bin: '++' },
      { label: 'y = 2x − 3', bin: '+-' },
      { label: 'A line up to the right through (0, −2)', bin: '+-' },
      { label: 'y = −2x + 1', bin: '-+' },
      { label: 'A line down to the right through (0, 4)', bin: '-+' },
      { label: 'y = 800 − 50x', bin: '-+' },
      { label: 'y = −x − 4', bin: '--' },
      { label: 'y = 5', bin: '0' },
    ],
  },

  // ── Equations with the unknown on both sides (8.EE.7) ──
  {
    kind: 'sort',
    id: 'm.8.multi-step-equations~how-many-solutions',
    title: 'One, none or infinitely many?',
    use: 'Use this for “Does 4x − 4 = 4x + 5 have one solution, none, or infinitely many?”',
    assumptions: [
      'Multiply out and gather each side into ax + b first.',
      'Different numbers of x on each side: exactly one solution.',
      'The same x but different numbers: no solution. The same x and the same number: every x works.',
    ],
    question: 'How many solutions does the equation have?',
    bins: [
      { id: 'one', label: 'One', why: 'Different numbers of x on each side.' },
      { id: 'none', label: 'None', why: 'The same x on both sides, different numbers.' },
      { id: 'all', label: 'Infinitely many', why: 'Both sides are the same expression.' },
    ],
    cards: [
      { label: '2(x + 3) = 5x + 6', bin: 'one' },
      { label: '2x + 2 = x + 1', bin: 'one' },
      { label: '−x − 3(x − 5) = 2(x − 5) + x', bin: 'one' },
      { label: 'x − 13 = x + 1', bin: 'none' },
      { label: '4x − 4 = 4x + 5', bin: 'none' },
      { label: 'x + 1/2 = x − 1/2', bin: 'none' },
      { label: '3x − x − 3 = 2x − 3', bin: 'all' },
      { label: '4x − 4 = 4x − 4', bin: 'all' },
      { label: '5(x + 2) = 5x + 10', bin: 'all' },
    ],
  },
  {
    kind: 'sequence',
    id: 'm.8.multi-step-equations~solve-order',
    title: 'Steps to solve 3x + 4 = x + 10',
    use: 'Use this for “What do you do first to solve 3x + 4 = x + 10?”',
    assumptions: [
      'Gather the x on one side first, then the numbers on the other.',
      'Whatever you do to one side, do to the other.',
      'Check by putting x back into both sides: they must come out equal.',
    ],
    question: 'Put the steps in order, first step first.',
    stages: [
      { label: '3x + 4 = x + 10' },
      { label: 'Take x from both sides: 2x + 4 = 10' },
      { label: 'Take 4 from both sides: 2x = 6' },
      { label: 'Divide both sides by 2: x = 3' },
      { label: 'Check: 3 × 3 + 4 = 13 and 3 + 10 = 13' },
    ],
  },

  // ── Systems of equations (8.EE.8) ──
  {
    kind: 'sort',
    id: 'm.8.systems-linear~how-many',
    title: 'How many solutions does the system have?',
    use: 'Use this for “Do y = 3x − 2 and y = 3x + 5 have a solution?”',
    assumptions: [
      'Write each line as y = mx + b and compare the slopes first.',
      'Different slopes: the lines cross once. Same slope, different intercepts: parallel.',
      'Same slope and same intercept: the same line, so every point on it is a solution.',
    ],
    question: 'How many solutions does the system have?',
    bins: [
      { id: 'one', label: 'One', why: 'Different slopes: the lines cross once.' },
      { id: 'none', label: 'None', why: 'Same slope, different intercepts: parallel.' },
      { id: 'all', label: 'Infinitely many', why: 'The same line written twice.' },
    ],
    cards: [
      { label: 'y = 2x + 1 and y = −x + 4', bin: 'one' },
      { label: 'x + y = 4 and y = x', bin: 'one' },
      { label: 'y = 4 and x = 2', bin: 'one' },
      { label: 'y = 3x − 2 and y = 3x + 5', bin: 'none' },
      { label: 'y = 1/2 x and y = 0.5x − 3', bin: 'none' },
      { label: 'y = x + 1 and 2y = 2x + 2', bin: 'all' },
      { label: '3x + y = 6 and y = 6 − 3x', bin: 'all' },
    ],
  },

  // ── Functions (8.F.1, 8.F.5) ──
  {
    kind: 'sort',
    id: 'm.8.functions-intro~is-it-a-function',
    title: 'Function or not?',
    use: 'Use this for “Is a student’s age a function of the student? Is the student a function of the age?”',
    assumptions: [
      'A function gives each input exactly one output.',
      'Two inputs may share an output; one input may not have two outputs.',
      'On a graph: a vertical line that crosses twice means not a function.',
    ],
    question: 'Is the output a function of the input?',
    bins: [
      { id: 'yes', label: 'Function', why: 'Every input has exactly one output.' },
      { id: 'no', label: 'Not a function', why: 'Some input has two outputs.' },
    ],
    cards: [
      { label: 'Input: a student. Output: their age', bin: 'yes' },
      { label: 'Input: x. Output: x²', bin: 'yes' },
      { label: '(1, 2), (2, 4), (3, 6)', bin: 'yes' },
      { label: 'Input: a day. Output: its high temperature', bin: 'yes' },
      { label: 'A line on a graph that is not vertical', bin: 'yes' },
      { label: 'Input: an age. Output: a student that age', bin: 'no' },
      { label: 'Input: x². Output: x', bin: 'no' },
      { label: '(1, 2), (1, 3), (2, 4)', bin: 'no' },
      { label: 'A circle on a graph', bin: 'no' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.8.functions-intro~story-graphs',
    title: 'Which graph fits the story?',
    use: 'Use this for “Two hoses fill a tank, then one is turned off. Which graph shows the water?”',
    assumptions: [
      'Read a graph left to right, as time goes on.',
      'Steeper means changing faster; flat means not changing.',
      'Going down means the amount is getting smaller.',
    ],
    question: 'Which graph shape fits the story?',
    bins: [
      { id: 'flat-rise', label: 'Flat, then rising', why: 'Steady, then it goes up.' },
      { id: 'rise-flat', label: 'Rising, then flat', why: 'It goes up, then stays.' },
      { id: 'steep-less', label: 'Steep, then less steep', why: 'Fast at first, then slower.' },
      { id: 'line', label: 'Straight line up', why: 'The same change every step.' },
      { id: 'up-down', label: 'Rising, then falling', why: 'Up, then down.' },
    ],
    cards: [
      { label: 'Casey’s speed: one speed for 2 minutes, then she speeds up', bin: 'flat-rise' },
      { label: 'Water poured into a glass until full, then left', bin: 'rise-flat' },
      { label: 'Two hoses fill a tank, then one is turned off', bin: 'steep-less' },
      { label: 'A plant grows the same amount every week', bin: 'line' },
      { label: 'Cost at a fair: $5 to enter, then $1 a ride', bin: 'line' },
      { label: 'The height of a ball thrown up and caught', bin: 'up-down' },
      { label: 'Marisa’s speed: speeds up, holds, then slows to a stop', bin: 'up-down' },
    ],
  },

  // ── Linear functions (8.F.3) ──
  {
    kind: 'sort',
    id: 'm.8.linear-functions~linear-or-not',
    title: 'Linear or not?',
    use: 'Use this for “Is the area of a square a linear function of its side?”',
    assumptions: [
      'A linear function changes y by the same amount for each step of x: y = mx + b.',
      'Its graph is a straight line.',
      'Squares, powers of x and x in an exponent are not linear.',
    ],
    question: 'Is the function linear?',
    bins: [
      { id: 'yes', label: 'Linear', why: 'The same change in y for each step of x.' },
      { id: 'no', label: 'Not linear', why: 'The change in y grows or shrinks.' },
    ],
    cards: [
      { label: 'y = 3x − 1', bin: 'yes' },
      { label: '(0, −1), (1, 2), (2, 5), (3, 8)', bin: 'yes' },
      { label: 'Perimeter of a square from its side', bin: 'yes' },
      { label: 'y = 800 − 50x', bin: 'yes' },
      { label: 'y = x² + 1', bin: 'no' },
      { label: '(1, 1), (2, 4), (3, 9)', bin: 'no' },
      { label: 'Area of a square from its side', bin: 'no' },
      { label: 'y = 2ˣ', bin: 'no' },
    ],
  },

  // ── Transformations (8.G.1–4) ──
  {
    kind: 'sort',
    id: 'm.8.transformations~which-move',
    title: 'Which move?',
    use: 'Use this for “Is it a flip, a slide or a turn?”',
    assumptions: [
      'A translation slides; a reflection flips over a line; a rotation turns about a point.',
      'Those three keep size and shape. A dilation changes the size, not the shape.',
      'A mirror image faces the other way; a turned image does not.',
    ],
    question: 'Which move takes the figure to its image?',
    bins: [
      { id: 'translate', label: 'Translation (slide)', why: 'Same way up, just moved.' },
      { id: 'reflect', label: 'Reflection (flip)', why: 'A mirror image across a line.' },
      { id: 'rotate', label: 'Rotation (turn)', why: 'Turned about a point.' },
      { id: 'dilate', label: 'Dilation (resize)', why: 'Same shape, a different size.' },
    ],
    cards: [
      { label: 'Same shape, same way up, moved right 5', bin: 'translate' },
      { label: 'Moved down 3 and left 2', bin: 'translate' },
      { label: 'A mirror image across a line', bin: 'reflect' },
      { label: 'The letter F facing left', bin: 'reflect' },
      { label: 'The shaded side up becomes the white side up', bin: 'reflect' },
      { label: 'Turned a quarter turn about a point', bin: 'rotate' },
      { label: 'The letter F upside down', bin: 'rotate' },
      { label: 'Turned 180°', bin: 'rotate' },
      { label: 'Twice as big, same shape', bin: 'dilate' },
      { label: 'Half the size', bin: 'dilate' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.8.transformations~congruent-or-similar',
    title: 'Congruent, similar or neither?',
    use: 'Use this for “Which figures are congruent to the first? Which are only similar?”',
    assumptions: [
      'Congruent: a slide, flip or turn takes one onto the other exactly.',
      'Similar: the same shape at another size; a dilation is needed too.',
      'If the side lengths are not all in the same ratio, they are neither.',
    ],
    question: 'Congruent, similar or neither?',
    bins: [
      { id: 'congruent', label: 'Congruent', why: 'Same size and shape.' },
      { id: 'similar', label: 'Similar, not congruent', why: 'Same shape, different size.' },
      { id: 'neither', label: 'Neither', why: 'The shapes differ.' },
    ],
    cards: [
      { label: 'Two 3-4-5 triangles, one turned', bin: 'congruent' },
      { label: 'A shape and its mirror image', bin: 'congruent' },
      { label: 'A 2 by 4 rectangle slid right', bin: 'congruent' },
      { label: 'A 3-4-5 triangle and a 6-8-10 triangle', bin: 'similar' },
      { label: 'A square of side 2 and a square of side 5', bin: 'similar' },
      { label: 'Two circles of different sizes', bin: 'similar' },
      { label: 'A 3-4-5 triangle and a 3-4-6 triangle', bin: 'neither' },
      { label: 'A 2 by 4 rectangle and a 2 by 6 rectangle', bin: 'neither' },
    ],
  },
];
