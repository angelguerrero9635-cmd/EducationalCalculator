/**
 * What each problem-type page is for, in one line: shown under its title in the grade list
 * and on the page, so students and teachers can pick the right one. Keyed by module id.
 */
export const PROBLEM_TYPE_USES: Record<string, string> = {
  // Kindergarten
  'm.K.add-sub-10~number-bond': 'Use this for “7 is 4 and ___” and other ways to split a number.',
  'm.K.add-sub-10~all-partners':
    'Use this to find every way to make a number, like 0 + 5 to 5 + 0.',
  'm.K.add-sub-10~take-away': 'Use this for “7 birds, 3 fly away. How many are left?”',
  'm.K.count-objects~five-group': 'Use this to see 6 to 10 as 5 and some more.',
  'm.K.count-objects~arrangements':
    'Use this to count dots in a line, in rows, in a circle or scattered.',
  'm.K.measurable-attributes~weight': 'Use this for “Which is heavier? How much heavier?”',
  'm.K.measurable-attributes~capacity': 'Use this for “Which jar holds more cups?”',
  'm.K.shapes-2d-3d~solids': 'Use this to tell flat shapes from solids, and which solids roll.',
  // Grade 1
  'm.1.add-sub-20~compare': 'Use this for “how many more?” and “how many fewer?” word problems.',
  'm.1.add-sub-20~take-from-ten': 'Use this for 14 − 8 by taking 8 from the 10.',
  'm.1.tens-ones~compare': 'Use this to compare two numbers with >, < or =.',
  'm.1.tens-ones~regroup': 'Use this for “2 tens and 17 ones is ___.”',
  'm.1.count-120~less': 'Use this for one less and ten less on the 120 chart.',
  'm.1.add-within-100~subtract-tens': 'Use this for 70 − 30 and other tens take away tens.',
  'm.1.equal-sign~true-false': 'Use this for “Is 6 + 1 = 5 + 2 true or false?”',
  'm.1.equal-sign~take-away': 'Use this for “Is 7 − 1 = 4 + 2 true or false?”',
  'm.1.measure-nonstandard~order': 'Use this to order three things from longest to shortest.',
  'm.1.data-3-categories~compare': 'Use this for “how many more?” in a picture graph.',
  'm.1.data-3-categories~tally': 'Use this to read and add up a tally chart.',
  'm.1.halves-fourths~equal-parts': 'Use this for “Is this shape cut into halves?”',
  // Grade 2
  'm.2.add-sub-100-fluency~tape': 'Use this for part-and-whole word problems with a bar model.',
  'm.2.add-sub-100-fluency~compare': 'Use this for “how many more?” word problems up to 100.',
  'm.2.add-sub-100-fluency~compare-combine':
    'Use this for “Ben has 8 more than Ana. How many in all?”',
  'm.2.add-sub-100-fluency~two-step': 'Use this for two-step problems: some come, then some go.',
  'm.2.add-sub-100-fluency~take-add': 'Use this for two-step problems: some go, then some come.',
  'm.2.add-sub-100-fluency~take-take': 'Use this for two-step problems where some go, twice.',
  'm.2.add-sub-100-fluency~add-add': 'Use this for two-step problems where some come, twice.',
  'm.2.add-sub-100-fluency~four-numbers': 'Use this to add up to four 2-digit numbers.',
  'm.2.place-value-1000~compare': 'Use this to compare 3-digit numbers with >, < or =.',
  'm.2.place-value-1000~expanded': 'Use this for expanded form, like 347 = 300 + 40 + 7.',
  'm.2.place-value-1000~regroup': 'Use this for “3 hundreds, 14 tens and 5 ones is ___.”',
  'm.2.add-sub-1000~ten-hundred-more': 'Use this for 10 more, 10 less, 100 more and 100 less.',
  'm.2.skip-count~back': 'Use this to count back by 5s, 10s or 100s.',
  'm.2.arrays~equal-groups': 'Use this for equal groups, like 3 bags of 4 apples.',
  'm.2.standard-length~number-line': 'Use this to add or subtract lengths on a number line.',
  'm.2.standard-length~broken-ruler': 'Use this when the object doesn’t start at 0 on the ruler.',
  'm.2.standard-length~two-units': 'Use this to measure the same object in feet and in inches.',
  'm.2.standard-length~meters': 'Use this to measure the same object in meters and in centimeters.',
  'm.2.money~change': 'Use this for “You pay $1. How much money is left?”',
  'm.2.money~more-needed': 'Use this for “How much more money do you need?”',
  'm.2.money~bills': 'Use this to count $10, $5 and $1 bills.',
  'm.2.money~one-coin': 'Use this to count one kind of coin, like 4 nickels.',
  'm.2.graphs-line-plots~compare': 'Use this for “how many more?” in a bar graph.',
  'm.2.graphs-line-plots~picture-graph': 'Use this to read a picture graph with four groups.',
  'm.2.graphs-line-plots~line-plot': 'Use this to make or read a line plot of lengths.',
  'm.2.thirds-polygons~polygons': 'Use this to name a shape by its sides and angles.',
  'm.2.thirds-polygons~rows-columns':
    'Use this to cut a rectangle into rows and columns of squares.',
  'm.2.thirds-polygons~solids': 'Use this to count faces, edges and corners of a cube or prism.',
};
