/**
 * Grade 7 math layout pages (sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../math/7.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

const MEAN_BINS = ['40–47', '48–55', '56–63', '64–71', '72–79'];

export const MATH_7_LAYOUTS: LayoutDef[] = [
  // ── Proportional relationships (7.RP.2) ──
  {
    kind: 'sort',
    id: 'm.7.proportional-relationships~proportional-or-not',
    title: 'Proportional or not?',
    use: 'Use this for “Does the table show a proportional relationship?” or “Is y = 2x + 1 proportional?”',
    assumptions: [
      'In a proportional relationship, y ÷ x is the same number for every pair: the constant k.',
      'Its graph is a straight line through (0, 0), and its equation is y = kx.',
      'An added or taken-away number, like the + 1 in y = 2x + 1, breaks it.',
    ],
    question: 'Is the relationship proportional?',
    bins: [
      {
        id: 'yes',
        label: 'Proportional',
        why: 'y ÷ x is the same for every pair, and (0, 0) fits.',
      },
      {
        id: 'no',
        label: 'Not proportional',
        why: 'The quotients differ, or the line misses (0, 0).',
      },
    ],
    cards: [
      { label: '(2, 6), (3, 9), (5, 15)', bin: 'yes' },
      { label: 'y = 4x', bin: 'yes' },
      { label: '(1, 2.5), (4, 10), (6, 15)', bin: 'yes' },
      { label: 'A 5 by 4 oval and a 10 by 8 oval', bin: 'yes' },
      { label: 'y = x ÷ 9', bin: 'yes' },
      { label: '(1, 3), (2, 5), (3, 7)', bin: 'no' },
      { label: 'y = 2x + 1', bin: 'no' },
      { label: '(2, 4), (3, 9), (4, 16)', bin: 'no' },
      { label: 'A 5 by 4 oval and a 10 by 6 oval', bin: 'no' },
      { label: 'Rope left: L = 120 − x', bin: 'no' },
    ],
  },

  // ── Percent applications (7.RP.3) ──
  {
    kind: 'sort',
    id: 'm.7.percent-applications~which-word',
    title: 'Tax, tip, markup, discount or commission?',
    use: 'Use this for “Is it a markup or a discount?” before working out the percent.',
    assumptions: [
      'Tax, tip and markup are added to a price: the new amount is 100% plus the percent.',
      'A discount is taken off: the sale price is 100% minus the percent.',
      'A commission is a percent of the sale that the seller keeps.',
    ],
    question: 'Which percent word fits the situation?',
    bins: [
      { id: 'tax', label: 'Tax', why: 'Added to the price and paid to the government.' },
      { id: 'tip', label: 'Tip', why: 'Added for service.' },
      { id: 'markup', label: 'Markup', why: 'A store adds it to what it paid.' },
      { id: 'discount', label: 'Discount', why: 'Taken off the price.' },
      { id: 'commission', label: 'Commission', why: 'A percent of the sale kept by the seller.' },
    ],
    cards: [
      { label: 'A store buys a bike for $200 and sells it for $260', bin: 'markup' },
      { label: '8% added to a $50 meal by the state', bin: 'tax' },
      { label: '20% left for the server', bin: 'tip' },
      { label: '30% off a $49.99 jacket', bin: 'discount' },
      { label: 'The agent keeps 3% of the house price', bin: 'commission' },
      { label: 'A coupon for 15% off', bin: 'discount' },
      { label: 'The dealership paid $8,350 and adds 17.4%', bin: 'markup' },
      { label: '6% on every purchase in the county', bin: 'tax' },
      { label: '$13 on a $67 bill for the waiter', bin: 'tip' },
      { label: '5% of each car sold goes to the salesperson', bin: 'commission' },
    ],
  },

  // ── Rational operations (7.NS.1–3) ──
  {
    kind: 'sort',
    id: 'm.7.rational-operations~which-sign',
    title: 'The sign of the answer',
    use: 'Use this for “Is (−5) × (−7) positive or negative?” before working it out.',
    assumptions: [
      'Multiply or divide: the same signs give a positive, different signs a negative.',
      'Add: the answer takes the sign of the number farther from 0. Opposites make 0.',
      'Subtract: add the opposite, then use the adding rule.',
      'Zero times any number is 0, which is neither positive nor negative.',
    ],
    question: 'What is the sign of the answer?',
    bins: [
      { id: 'pos', label: 'Positive', why: 'Greater than 0.' },
      { id: 'neg', label: 'Negative', why: 'Less than 0.' },
      { id: 'zero', label: 'Zero', why: 'Neither: opposites cancel, or a factor is 0.' },
    ],
    cards: [
      { label: '(−5) × (−7)', bin: 'pos' },
      { label: '−3 − 8', bin: 'neg' },
      { label: '48 ÷ (−8)', bin: 'neg' },
      { label: '−2.5 + 2.5', bin: 'zero' },
      { label: '12 + (−4)', bin: 'pos' },
      { label: '(−7) × 2', bin: 'neg' },
      { label: '−9 − (−9)', bin: 'zero' },
      { label: '−3.4 × 0.5', bin: 'neg' },
      { label: '(−40) ÷ (−8)', bin: 'pos' },
      { label: '0 × (−6)', bin: 'zero' },
    ],
  },

  // ── Two-step equations (7.EE.4) ──
  {
    kind: 'sort',
    id: 'm.7.two-step-equations~which-equation',
    title: 'Which equation matches the story?',
    use: 'Use this for “Which equation shows 3 friends each paying x and a $5 tip, $20 in all?”',
    assumptions: [
      'px + q = r: p equal parts, then q more (or less) once.',
      'p(x + q) = r: p groups, and each group has x and q more (or less).',
      'Ask whether the extra happens once or once in every group.',
    ],
    question: 'Which form of equation matches the story?',
    bins: [
      { id: 'px+q', label: 'px + q = r', why: 'p equal parts and q more make r.' },
      { id: 'px-q', label: 'px − q = r', why: 'q taken from p equal parts leaves r.' },
      { id: 'p(x+q)', label: 'p(x + q) = r', why: 'p groups, each x and q more.' },
      { id: 'p(x-q)', label: 'p(x − q) = r', why: 'p groups, each q less than x.' },
    ],
    cards: [
      { label: 'A family buys 6 tickets and pays a $3 fee, $27 in all', bin: 'px+q' },
      { label: '4 shirts at x dollars plus $8 shipping is $60', bin: 'px+q' },
      { label: '3 equal bags of x oz of trail mix, less 5 oz eaten, leave 20 oz', bin: 'px-q' },
      { label: '5 hours at x dollars an hour, minus a $10 fee, is $60', bin: 'px-q' },
      { label: '3 friends each pay x and a $5 tip each; $20 in all', bin: 'p(x+q)' },
      { label: 'Each of 4 boxes holds x and 2 extra; 36 in all', bin: 'p(x+q)' },
      { label: '3 boxes of markers, 15 given away from each, 90 left', bin: 'p(x-q)' },
      { label: '2 pizzas at x dollars with a $3 coupon off each, $24 in all', bin: 'p(x-q)' },
    ],
  },
  {
    kind: 'sequence',
    id: 'm.7.two-step-equations~solve-order',
    title: 'Steps to solve 3x + 2 = 11',
    use: 'Use this for “What do you do first to solve 3x + 2 = 11?”',
    assumptions: [
      'Undo the steps in the reverse order: the + 2 was done last, so it is undone first.',
      'Whatever you do to one side, do to the other so they stay equal.',
      'Check by putting the answer back into the first equation.',
    ],
    question: 'Put the steps in order, first step first.',
    stages: [
      { label: '3x + 2 = 11' },
      { label: 'Take 2 from both sides: 3x = 9' },
      { label: 'Divide both sides by 3: x = 3' },
      { label: 'Check: 3 × 3 + 2 = 11' },
    ],
  },

  // ── Scale drawings (7.G.1) ──
  {
    kind: 'sort',
    id: 'm.7.scale-drawings~scaled-or-not',
    title: 'Scaled copy or not?',
    use: 'Use this for “Which figure is a scaled copy of the original?”',
    assumptions: [
      'A scaled copy multiplies every length by the same scale factor.',
      'Angles stay the same, and every part stays in its place.',
      'The original is a letter A 2 units wide and 2 units tall, crossbar halfway up.',
    ],
    question: 'Is it a scaled copy of the 2 by 2 letter A?',
    bins: [
      {
        id: 'yes',
        label: 'Scaled copy',
        why: 'Every length was multiplied by the same number.',
      },
      {
        id: 'no',
        label: 'Not a scaled copy',
        why: 'The width and height changed by different numbers, or a part moved.',
      },
    ],
    cards: [
      { label: '4 by 4, crossbar halfway up', bin: 'yes' },
      { label: '1 by 1, crossbar halfway up', bin: 'yes' },
      { label: '6 by 6, crossbar halfway up', bin: 'yes' },
      { label: '2 wide, 3 tall', bin: 'no' },
      { label: '3 by 3 with the crossbar at the bottom', bin: 'no' },
      { label: '4 wide, 2 tall', bin: 'no' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.7.scale-drawings~same-scale',
    title: 'The same scale, said another way',
    use: 'Use this for “Which scale is the same as 1 cm to 100 m?”',
    assumptions: [
      'Write both lengths in the same unit, then compare: 1 cm to 100 m is 1 cm to 10,000 cm.',
      'A scale with no units, like 1 to 10,000, means the same in any unit.',
      'Multiplying both parts by the same number keeps the scale.',
    ],
    question: 'Does it say the same scale as 1 cm to 100 m?',
    bins: [
      { id: 'same', label: 'Same scale', why: '1 on the drawing is 10,000 in real life.' },
      { id: 'different', label: 'Different scale', why: 'Another number of real units per unit.' },
    ],
    cards: [
      { label: '5 cm to 500 m', bin: 'same' },
      { label: '1 mm to 10 m', bin: 'same' },
      { label: '10 cm to 1 km', bin: 'same' },
      { label: '1 to 10,000', bin: 'same' },
      { label: '5 cm to 50 m', bin: 'different' },
      { label: '100 cm to 1 m', bin: 'different' },
      { label: '1 to 1,000', bin: 'different' },
      { label: '2 cm to 100 m', bin: 'different' },
    ],
  },

  // ── Circles (7.G.4) ──
  {
    kind: 'sort',
    id: 'm.7.circles~circumference-or-area',
    title: 'Circumference or area?',
    use: 'Use this for “Is it circumference or area?” before choosing the formula.',
    assumptions: [
      'Circumference is a length: the distance around, C = πd. Its units are cm, m, ft.',
      'Area is a surface: the space inside, A = πr². Its units are square: cm², m², ft².',
    ],
    question: 'Does the question ask for circumference or area?',
    bins: [
      {
        id: 'C',
        label: 'Circumference',
        why: 'A length around: fence, lace, one turn of a wheel.',
      },
      { id: 'A', label: 'Area', why: 'A surface covered: paint, grass, fabric, pizza.' },
    ],
    cards: [
      { label: 'Lace around a circular tablecloth', bin: 'C' },
      { label: 'How far a wheel rolls in one turn', bin: 'C' },
      { label: 'A fence around a circular pond', bin: 'C' },
      { label: 'The distance around a running track’s curve', bin: 'C' },
      { label: 'Grass seed for a round lawn', bin: 'A' },
      { label: 'Fabric for a half-circle window', bin: 'A' },
      { label: 'Paint for a round sign', bin: 'A' },
      { label: 'Cheese covering a pizza', bin: 'A' },
    ],
  },

  // ── Angle relationships (7.G.5) ──
  {
    kind: 'sort',
    id: 'm.7.angle-relationships~which-pair',
    title: 'Which kind of angle pair?',
    use: 'Use this for “Are these angles complementary, supplementary or vertical?”',
    assumptions: [
      'Complementary angles add to 90°. Supplementary angles add to 180°.',
      'Vertical angles sit across from each other where two lines cross, and they are equal.',
      'Adjacent angles share a side; they can be any of these or none.',
    ],
    question: 'Which kind of angle pair is it?',
    bins: [
      { id: 'comp', label: 'Complementary', why: 'They add to 90°.' },
      { id: 'supp', label: 'Supplementary', why: 'They add to 180°.' },
      {
        id: 'vert',
        label: 'Vertical',
        why: 'Across from each other where two lines cross: equal.',
      },
      { id: 'none', label: 'Neither', why: 'They add to neither 90° nor 180°.' },
    ],
    cards: [
      { label: '35° and 55°', bin: 'comp' },
      { label: 'A right angle split in two', bin: 'comp' },
      { label: '115° and 65°', bin: 'supp' },
      { label: 'Two angles that make a straight line', bin: 'supp' },
      { label: 'A 90° angle and a 90° angle', bin: 'supp' },
      { label: 'Across a crossing, both 50°', bin: 'vert' },
      { label: '40° and 40° side by side', bin: 'none' },
      { label: '30° and 50°', bin: 'none' },
    ],
  },

  // ── Prisms (7.G.3, 7.G.6) ──
  {
    kind: 'sort',
    id: 'm.7.prisms~cross-section',
    title: 'Slicing a solid',
    use: 'Use this for “What shape is the cross-section when the pyramid is cut parallel to its base?”',
    assumptions: [
      'A cross-section is the flat face a straight cut leaves.',
      'A cut parallel to a prism’s base has the shape and size of the base.',
      'A pyramid cut parallel to its base leaves a smaller copy of the base.',
    ],
    question: 'What shape is the cross-section?',
    bins: [
      { id: 'rectangle', label: 'Rectangle', why: 'Four square corners, sides not all equal.' },
      { id: 'square', label: 'Square', why: 'Four square corners and four equal sides.' },
      { id: 'triangle', label: 'Triangle', why: 'Three sides.' },
      { id: 'trapezoid', label: 'Trapezoid', why: 'Four sides, just one pair parallel.' },
    ],
    cards: [
      { label: 'A 6 by 4 by 5 box cut parallel to its 6 by 4 base', bin: 'rectangle' },
      { label: 'A cube cut from a top edge to the opposite bottom edge', bin: 'rectangle' },
      { label: 'A triangular prism cut parallel to a rectangular face', bin: 'rectangle' },
      { label: 'A cube cut parallel to a face', bin: 'square' },
      { label: 'A square pyramid cut parallel to its base', bin: 'square' },
      { label: 'A square pyramid cut straight down through its top point', bin: 'triangle' },
      { label: 'A triangular prism cut parallel to its triangle ends', bin: 'triangle' },
      { label: 'A square pyramid cut straight down, missing its top point', bin: 'trapezoid' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.7.prisms~prism-or-not',
    title: 'Prism or not?',
    use: 'Use this for “Which solids are prisms?” before using V = Bh.',
    assumptions: [
      'A prism has two matching, parallel bases joined by rectangles.',
      'It is named for its base: a triangular prism has triangle bases.',
      'Its volume is the base area times the height: V = Bh.',
    ],
    question: 'Is the solid a prism?',
    bins: [
      { id: 'yes', label: 'Prism', why: 'Two matching parallel bases joined by rectangles.' },
      { id: 'no', label: 'Not a prism', why: 'It comes to a point, or a face is curved.' },
    ],
    cards: [
      { label: 'Triangular prism', bin: 'yes' },
      { label: 'Pentagonal prism', bin: 'yes' },
      { label: 'Cube', bin: 'yes', figure: { kind: 'solid', shape: 'cube' } },
      { label: 'Box', bin: 'yes', figure: { kind: 'solid', shape: 'box' } },
      { label: 'Square pyramid', bin: 'no' },
      { label: 'Cylinder', bin: 'no', figure: { kind: 'solid', shape: 'cylinder' } },
      { label: 'Cone', bin: 'no', figure: { kind: 'solid', shape: 'cone' } },
      { label: 'Sphere', bin: 'no', figure: { kind: 'solid', shape: 'sphere' } },
    ],
  },

  // ── Sampling (7.SP.1–2) ──
  {
    kind: 'sort',
    id: 'm.7.sampling~good-sample',
    title: 'Random sample or not?',
    use: 'Use this for “Which way of choosing students gives a random sample of the school?”',
    assumptions: [
      'In a random sample, every member of the population has the same chance to be picked.',
      'People who choose themselves, or who are easy to reach, are not a random sample.',
      'A random sample can describe the whole population; a biased one leans one way.',
    ],
    question: 'Would this give a random sample of the school?',
    bins: [
      { id: 'yes', label: 'Random sample', why: 'Everyone had the same chance to be picked.' },
      {
        id: 'no',
        label: 'Not random',
        why: 'Some were more likely to be picked, or picked themselves.',
      },
    ],
    cards: [
      { label: 'Draw 50 names from a box of every student’s name', bin: 'yes' },
      { label: 'Number the students and use a random number list', bin: 'yes' },
      { label: 'Pick 50 student ID numbers at random', bin: 'yes' },
      { label: 'Ask the first 50 students into the cafeteria', bin: 'no' },
      { label: 'Ask one algebra class', bin: 'no' },
      { label: 'Ask fans at a baseball game about the favorite sport', bin: 'no' },
      { label: 'Post a survey and count who answers', bin: 'no' },
    ],
  },
  {
    kind: 'observe',
    id: 'm.7.sampling~variability',
    title: 'Sample means vary',
    use: 'Use this for “Many samples of 40 fans each give a mean. What does the spread of the means say?”',
    assumptions: [
      'Each sample of 40 fans gives a mean distance traveled, in miles.',
      'The bars count how many samples had a mean in each interval.',
      'Different samples give different means, but most land near the population mean.',
    ],
    histogram: true,
    columns: MEAN_BINS,
    rowLabel: 'Samples',
    unit: 'samples',
    max: 40,
    step: 1,
    initial: [3, 18, 40, 30, 9],
    pattern: (values) => {
      const total = values.reduce((s, x) => s + x, 0);
      if (total === 0) return 'No samples yet: raise a bar.';
      const most = Math.max(...values);
      const where = MEAN_BINS.filter((_, i) => values[i] === most);
      return `Most sample means (${most} of ${total}) fall in ${where.join(' and ')} miles, so the population mean is probably there.`;
    },
  },

  // ── Probability (7.SP.5) ──
  {
    kind: 'sort',
    id: 'm.7.probability~likely',
    title: 'How likely is it?',
    use: 'Use this for “Is a probability of 0.345 likely or unlikely?”',
    assumptions: [
      'A probability is a number from 0 to 1.',
      '0 means impossible, 1 means certain, and 1/2 means as likely as not.',
      'A percent works too: 75% is 0.75, which is likely.',
    ],
    question: 'How likely is it?',
    bins: [
      { id: '0', label: 'Impossible (0)', why: 'It can never happen.' },
      { id: 'low', label: 'Unlikely (under 1/2)', why: 'It happens less often than not.' },
      { id: 'half', label: 'As likely as not (1/2)', why: 'Half the time in the long run.' },
      { id: 'high', label: 'Likely (over 1/2)', why: 'It happens more often than not.' },
      { id: '1', label: 'Certain (1)', why: 'It always happens.' },
    ],
    cards: [
      { label: 'Rolling a 7 on one die', bin: '0' },
      { label: 'An odd number from the digits 6, 2 and 8', bin: '0' },
      { label: 'A 3-point shot by a player who makes 0.345 of them', bin: 'low' },
      { label: 'A blue marble from a bag with 3 blue of 10', bin: 'low' },
      { label: 'Heads on a fair coin', bin: 'half' },
      { label: 'Rain when the forecast says 75%', bin: 'high' },
      { label: 'A free throw by a player who makes 60%', bin: 'high' },
      { label: 'A card above 3 from cards numbered 1 to 8', bin: 'high' },
      { label: 'The sun rising tomorrow', bin: '1' },
      { label: 'Red or blue on a spinner that is only red and blue', bin: '1' },
    ],
  },
];
