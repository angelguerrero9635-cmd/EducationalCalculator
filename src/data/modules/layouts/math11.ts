/**
 * Grade 11 math layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../math/11.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

export const MATH_11_LAYOUTS: LayoutDef[] = [
  // ── Parent functions and transformations (F-BF.3) ──
  {
    kind: 'sort',
    id: 'm.11.function-transformations~name-the-move',
    title: 'Name the move',
    use: 'Use this for “Which change is f(x − 3), and which is f(x) − 3?”',
    assumptions: [
      'A change inside the brackets acts on x: it moves the graph sideways, opposite to its sign.',
      'A change outside acts on y, the way it reads: + 4 moves the graph up 4.',
      'A minus sign reflects: −f(x) across the x-axis, f(−x) across the y-axis.',
    ],
    question: 'What does the change do to the graph of y = f(x)?',
    bins: [
      {
        id: 'v',
        label: 'Vertical shift',
        why: 'A number added outside f moves every y up or down.',
      },
      {
        id: 'h',
        label: 'Horizontal shift',
        why: 'A number added inside the brackets moves the graph left or right, opposite to its sign.',
      },
      { id: 'r', label: 'Reflection', why: 'A minus sign outside flips y; inside, it flips x.' },
      {
        id: 's',
        label: 'Stretch or compression',
        why: 'A factor outside scales y; a factor inside scales x by its reciprocal.',
      },
    ],
    cards: [
      { label: 'y = f(x) + 4', bin: 'v' },
      { label: 'y = f(x) − 2', bin: 'v' },
      { label: 'y = f(x + 5)', bin: 'h' },
      { label: 'y = f(x − 1)', bin: 'h' },
      { label: 'y = −f(x)', bin: 'r' },
      { label: 'y = f(−x)', bin: 'r' },
      { label: 'y = 3f(x)', bin: 's' },
      { label: 'y = ½f(x)', bin: 's' },
      { label: 'y = f(x/2)', bin: 's' },
    ],
  },

  // ── Polynomial functions: end behavior (F-IF.7c) ──
  {
    kind: 'sort',
    id: 'm.11.polynomial-functions~end-behavior',
    title: 'End behavior',
    use: 'Use this for “Describe the end behavior of y = −3x⁵ + 2x² − 1.”',
    assumptions: [
      'Only the leading term decides the ends: far from 0 it outgrows every other term.',
      'An even degree sends both ends the same way; an odd degree sends them opposite ways.',
      'A negative leading coefficient flips both ends.',
    ],
    question: 'Where do the ends of the graph go?',
    bins: [
      { id: 'uu', label: 'Up on both ends', why: 'Even degree, positive leading coefficient.' },
      { id: 'dd', label: 'Down on both ends', why: 'Even degree, negative leading coefficient.' },
      { id: 'du', label: 'Down left, up right', why: 'Odd degree, positive leading coefficient.' },
      { id: 'ud', label: 'Up left, down right', why: 'Odd degree, negative leading coefficient.' },
    ],
    cards: [
      { label: 'y = x⁴ − 5x² + 4', bin: 'uu' },
      { label: 'y = 2x⁴ + x³', bin: 'uu' },
      { label: 'y = −2x⁶ + x', bin: 'dd' },
      { label: 'y = −x² + 7', bin: 'dd' },
      { label: 'y = x³ − 4x', bin: 'du' },
      { label: 'y = 0.5x⁵ + 2x⁴', bin: 'du' },
      { label: 'y = −x³ + 2x²', bin: 'ud' },
      { label: 'y = 4 − x⁵', bin: 'ud' },
    ],
  },

  // ── Logarithms: the log rules (F-LE.4) ──
  {
    kind: 'sort',
    id: 'm.11.logarithms~properties',
    title: 'Which log rule?',
    use: 'Use this for “Expand log₅(25/y)” or “Is log(x + y) = log x + log y true?”',
    assumptions: [
      'A log turns multiplying into adding, dividing into subtracting and a power into multiplying.',
      'The rules come from the exponent rules, since a log is an exponent.',
      'A sum inside a log does not split, and a log of a log is not a power rule.',
    ],
    question: 'Which rule makes the equation true?',
    bins: [
      { id: 'product', label: 'Product rule', why: 'log(MN) = log M + log N.' },
      { id: 'quotient', label: 'Quotient rule', why: 'log(M/N) = log M − log N.' },
      { id: 'power', label: 'Power rule', why: 'log(Mᵖ) = p log M, and a root is the power ½.' },
      {
        id: 'not',
        label: 'Not a log rule',
        why: 'These two sides are not equal for most numbers: no rule splits a sum or a quotient of logs.',
      },
    ],
    cards: [
      { label: 'log₂(8x) = 3 + log₂ x', bin: 'product' },
      { label: 'log(ab) = log a + log b', bin: 'product' },
      { label: 'log₅(25/y) = 2 − log₅ y', bin: 'quotient' },
      { label: 'ln(x/3) = ln x − ln 3', bin: 'quotient' },
      { label: 'log(x³) = 3 log x', bin: 'power' },
      { label: 'log₂ √x = ½ log₂ x', bin: 'power' },
      { label: 'log(x + y) = log x + log y', bin: 'not' },
      { label: '(log x)² = 2 log x', bin: 'not' },
      { label: 'log x/log y = log x − log y', bin: 'not' },
    ],
  },

  // ── Pythagorean identities: simplify (F-TF.8) ──
  {
    kind: 'sort',
    id: 'm.11.pythagorean-identities~simplify',
    title: 'Simplify with the identities',
    use: 'Use this for “Simplify (1 − cos θ)(1 + cos θ)” or “sin²(3x) + cos²(3x)”.',
    assumptions: [
      'Each card is x² + y² = 1 on the unit circle, rearranged or divided through by cos²θ.',
      'sin²θ + cos²θ = 1 holds for every angle: 5x as well as θ.',
      'Dividing by cos²θ gives tan²θ + 1 = sec²θ.',
    ],
    question: 'What does the expression simplify to?',
    bins: [
      { id: 'one', label: '1', why: 'sin²θ + cos²θ = 1, and sec²θ − tan²θ = 1.' },
      { id: 'sin', label: 'sin²θ', why: 'sin²θ = 1 − cos²θ.' },
      { id: 'cos', label: 'cos²θ', why: 'cos²θ = 1 − sin²θ.' },
      { id: 'sec', label: 'sec²θ', why: 'sec²θ = 1 + tan²θ = 1/cos²θ.' },
    ],
    cards: [
      { label: 'sin²(5x) + cos²(5x)', bin: 'one' },
      { label: 'sec²θ − tan²θ', bin: 'one' },
      { label: 'cos²θ(1 + tan²θ)', bin: 'one' },
      { label: '1 − cos²θ', bin: 'sin' },
      { label: '(1 − cos θ)(1 + cos θ)', bin: 'sin' },
      { label: 'tan²θ cos²θ', bin: 'sin' },
      { label: '1 − sin²θ', bin: 'cos' },
      { label: '(1 + sin θ)(1 − sin θ)', bin: 'cos' },
      { label: '1 + tan²θ', bin: 'sec' },
      { label: '1/cos²θ', bin: 'sec' },
    ],
  },

  // ── Sampling methods and study design (S-IC.1, S-IC.3) ──
  {
    kind: 'explore',
    id: 'm.11.study-design',
    assumptions: [
      'A sample is taken from the population; a random sample stands for it fairly.',
      'Only an experiment assigns treatments at random, so only it can show cause and effect.',
      'A control group, often given a placebo, is what the treatment is compared with.',
    ],
    figure: { kind: 'studyDesign' },
    scenes: [
      {
        label: 'Survey',
        lines: [
          '12 of the 48 people are picked at random and asked a question.',
          'Their answers estimate the whole group’s.',
        ],
        study: { design: 'survey', method: 'simple random', sample: 12, lit: 'sample' },
      },
      {
        label: 'Observational study',
        lines: [
          'Researchers record who already sleeps 8 hours and compare grades.',
          'Nobody is assigned, so a link does not show a cause.',
        ],
        study: {
          design: 'observational',
          groups: ['Sleeps 8 hours', 'Sleeps less'],
          lit: 'population',
        },
      },
      {
        label: 'Experiment',
        lines: [
          'Chance assigns each volunteer to a group, so the groups differ only in the treatment.',
          'A difference in results can then be caused by the treatment.',
        ],
        study: {
          design: 'experiment',
          groups: ['New schedule', 'Usual schedule'],
          lit: 'groups',
        },
      },
      {
        label: 'Control and placebo',
        lines: [
          'The placebo group takes a look-alike pill.',
          'Believing in the pill then cannot explain a difference between the groups.',
        ],
        study: { design: 'experiment', groups: ['Vitamin', 'Placebo'], lit: 'groups' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.11.study-design~sampling-methods',
    title: 'Which sampling method?',
    use: 'Use this for “A school picks 20 students at random from each grade. Which sampling method is this?”',
    assumptions: [
      'Random picks give every member a known chance of being chosen.',
      'Strata make sure every group is in the sample; clusters save travel.',
      'A convenience sample is easy but usually biased.',
    ],
    question: 'Which sampling method is it?',
    bins: [
      {
        id: 'random',
        label: 'Simple random',
        why: 'Every member, and every group of that size, has the same chance.',
      },
      {
        id: 'stratified',
        label: 'Stratified',
        why: 'The population is split into groups, and some are picked at random from each.',
      },
      {
        id: 'cluster',
        label: 'Cluster',
        why: 'Whole groups are picked at random, and everyone in them is asked.',
      },
      {
        id: 'systematic',
        label: 'Systematic',
        why: 'Every kth member of a list, from a random start.',
      },
      {
        id: 'convenience',
        label: 'Convenience',
        why: 'Whoever is easiest to reach: not random, so it can be biased.',
      },
    ],
    cards: [
      { label: 'Draw 50 student ID numbers at random', bin: 'random' },
      { label: 'Number every apartment and let a random generator pick 20', bin: 'random' },
      { label: 'Pick 20 students at random from each grade', bin: 'stratified' },
      {
        label: 'Split the team into starters and bench and pick at random from each',
        bin: 'stratified',
      },
      { label: 'Choose 5 homerooms at random and ask everyone in them', bin: 'cluster' },
      { label: 'Pick 3 city blocks at random and visit every home', bin: 'cluster' },
      { label: 'Take every 10th name after a random start', bin: 'systematic' },
      { label: 'Test every 4th battery off the line', bin: 'systematic' },
      { label: 'Ask the first 30 people through the door', bin: 'convenience' },
      { label: 'Ask the friends at your lunch table', bin: 'convenience' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.11.study-design~study-type',
    title: 'Survey, observational study or experiment?',
    use: 'Use this for “Researchers compare the heart rates of runners and non-runners. What kind of study is this?”',
    assumptions: [
      'A survey asks a sample questions.',
      'An observational study records what people already do; nothing is assigned.',
      'Only an experiment assigns the treatment, so only an experiment can show cause and effect.',
    ],
    question: 'What kind of study is it?',
    bins: [
      { id: 'survey', label: 'Survey', why: 'It asks people questions and records the answers.' },
      {
        id: 'observational',
        label: 'Observational study',
        why: 'It records what people already do or chose, with nothing assigned.',
      },
      {
        id: 'experiment',
        label: 'Experiment',
        why: 'It assigns the treatment by chance and compares the groups.',
      },
    ],
    cards: [
      { label: 'Ask 200 randomly chosen voters which park plan they prefer', bin: 'survey' },
      { label: 'Ask a random sample of students how many hours they study', bin: 'survey' },
      { label: 'Mail a recycling questionnaire to randomly chosen homes', bin: 'survey' },
      {
        label: 'Compare resting heart rates of people who already run with those who don’t',
        bin: 'observational',
      },
      {
        label: 'Read hospital records of patients who chose surgery or medicine',
        bin: 'observational',
      },
      {
        label: 'Follow teens for 5 years, recording screen time and grades',
        bin: 'observational',
      },
      {
        label: 'Randomly assign plants to fertilizer or none and measure height',
        bin: 'experiment',
      },
      {
        label: 'Flip a coin to give each class a new warm-up or the usual one',
        bin: 'experiment',
      },
      {
        label: 'Randomly assign volunteers to a sleep app or no app and compare sleep',
        bin: 'experiment',
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.11.study-design~bias',
    title: 'Name the bias',
    use: 'Use this for “A website asks readers to vote in a poll. What kind of bias is this?”',
    assumptions: [
      'Bias comes from who is reached, who answers, who chooses to answer, and how the question is asked.',
      'A bigger sample does not fix bias: it repeats the same mistake more times.',
    ],
    question: 'What kind of bias is it?',
    bins: [
      {
        id: 'under',
        label: 'Undercoverage',
        why: 'Part of the population can never be picked.',
      },
      {
        id: 'non',
        label: 'Nonresponse',
        why: 'Many of the people picked never answer.',
      },
      {
        id: 'voluntary',
        label: 'Voluntary response',
        why: 'People choose themselves, and those with strong views answer most.',
      },
      {
        id: 'response',
        label: 'Response bias',
        why: 'The wording or the setting pushes people toward an answer.',
      },
    ],
    cards: [
      { label: 'A phone survey that calls only landlines', bin: 'under' },
      {
        label: 'A school survey that leaves out students who are absent that week',
        bin: 'under',
      },
      { label: 'Half the chosen homes never return the form', bin: 'non' },
      { label: 'Most people picked for a long interview hang up', bin: 'non' },
      { label: 'A website asks readers to vote in a poll', bin: 'voluntary' },
      { label: 'A radio show asks listeners to call in their opinion', bin: 'voluntary' },
      { label: 'Asking “Don’t you agree the park is unsafe?”', bin: 'response' },
      {
        label: 'Asking students in front of their teacher whether they cheat',
        bin: 'response',
      },
    ],
  },
];
