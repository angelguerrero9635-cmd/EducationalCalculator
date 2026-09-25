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
  'm.K.count-objects~arrangements': 'Use this to count dots in a line, in rows or scattered.',
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
  // Grade 3
  'm.3.multiply-divide-100~array':
    'Use this for rows and columns: “6 rows of 4 chairs. How many chairs?”',
  'm.3.multiply-divide-100~jumps':
    'Use this for equal jumps on a number line: “How many jumps of 5 to get to 30?”',
  'm.3.multiplication-properties~grouping':
    'Use this to multiply three numbers, like 3 × 5 × 2, by picking an easy pair first.',
  'm.3.multiplication-properties~order':
    'Use this for 4 × 7 = 7 × 4: turn the array to use a fact you know.',
  'm.3.two-step-problems~multiply-add':
    'Use this for “3 boxes of 8 crayons and 5 more. How many in all?”',
  'm.3.two-step-problems~share':
    'Use this for “18 red and 12 blue beads, shared equally on 5 strings. How many on each?”',
  'm.3.rounding~estimate': 'Use this to estimate a sum by rounding, and check an answer.',
  'm.3.rounding~hundred': 'Use this to round a 3-digit number to the nearest hundred.',
  'm.3.fractions-number-line~wholes':
    'Use this to write a whole number as a fraction, like 2 = 8/4.',
  'm.3.fractions-number-line~shapes': 'Use this to name the shaded part of a shape, like 3/4.',
  'm.3.compare-fractions~same-numerator': 'Use this for “Which is more, 2/3 or 2/6?”',
  'm.3.compare-fractions~same-denominator': 'Use this for “Which is more, 3/8 or 5/8?”',
  'm.3.elapsed-time~elapsed':
    'Use this for “It starts at 3:45 and takes 35 minutes. When does it end?” and “How long?”',
  'm.3.mass-liquid-volume~liquid':
    'Use this for liters: “3 L in the jug, pour in 4 L. How much now?”',
  'm.3.mass-liquid-volume~bags': 'Use this for “5 bags of 3 kg each. How heavy in all?”',
  'm.3.area~tiling': 'Use this to find area by counting unit squares in rows.',
  'm.3.area~rectilinear': 'Use this to find the area of an L-shape made of two rectangles.',
  'm.3.area~split':
    'Use this to split a rectangle into two and add the areas: 6 × 8 = 6 × 5 + 6 × 3.',
  'm.3.perimeter~missing-side': 'Use this when you know the perimeter and every side but one.',
  'm.3.perimeter~same-perimeter':
    'Use this to compare rectangles with the same perimeter but different areas.',
  'm.3.measure-line-plots~quarter-inch':
    'Use this to read a length on a ruler marked in halves or quarters of an inch.',
  'm.3.scaled-graphs~picture-graph':
    'Use this for picture graphs where each picture stands for 2, 5 or 10.',
  // Science, Kindergarten–Grade 3
  's.K.pushes-pulls~forward': 'Use this for “5 pushes forward, 2 back. How many spaces forward?”',
  's.K.pushes-pulls~back': 'Use this for “2 pushes forward, 6 back. How many spaces back?”',
  's.K.sunlight-warms~warming': 'Use this for “The water was 70 °F. It warmed 6 °F. How warm now?”',
  's.K.living-needs~food': 'Use this for “A rabbit eats 2 carrots a day. How many in 3 days?”',
  's.K.weather-patterns~warmer':
    'Use this for “Is today warmer or cooler than yesterday? By how much?”',
  's.K.weather-patterns~storm': 'Use this to count storm jobs done and storm jobs left.',
  's.K.living-things-change-environment~litter': 'Use this to count the litter picked up, by kind.',
  's.1.sound-vibration~drum': 'Use this for “Which hit made more rice jump? How many more?”',
  's.1.sound-vibration~signals': 'Use this to count the flashes in a message sent with light.',
  's.1.light-shadows~materials': 'Use this to sort materials by how much light gets through.',
  's.1.structures-function~beaks': 'Use this to compare two beaks and say which food each fits.',
  's.1.offspring~grow':
    'Use this for “The young plant is 5 cubes. How much more to be like its parent?”',
  's.1.sky-patterns~moon':
    'Use this for “It is 6 days since the new moon. How long until it is full?”',
  's.2.material-properties~pieces':
    'Use this for “A 30-block tower is rebuilt as a house. How many blocks are left over?”',
  's.2.material-properties~sort': 'Use this to sort materials by a property and count each group.',
  's.2.heating-cooling~cooling': 'Use this for “Water at 68 °F cools 36 °F. How cold is it now?”',
  's.2.heating-cooling~warming': 'Use this for “Water at 40 °F warms 35 °F. How warm is it now?”',
  's.2.plant-growth-investigation~water':
    'Use this for “The watered plant is 22 cm, the dry one 8 cm. How much taller?”',
  's.2.plant-growth-investigation~week':
    'Use this for “The plant was 18 cm. Now it is 25 cm. How much did it grow?”',
  's.2.pollination-dispersal~visits':
    'Use this to count a bee’s visits in the morning and the afternoon.',
  's.2.habitats~pond-count': 'Use this to count the animals seen in one habitat, by kind.',
  's.2.erosion-landforms~wall': 'Use this to compare soil lost with and without a wall.',
  's.2.erosion-landforms~map': 'Use this to count the land and water places on a map.',
  's.2.water-on-earth~fresh':
    'Use this to see where Earth’s fresh water is: ice, rivers and lakes, or under the ground.',
  's.3.balanced-forces~tug': 'Use this to add up a team’s pull in a tug of war.',
  's.3.balanced-forces~swings': 'Use this to predict a pendulum’s swings from its steady pattern.',
  's.3.magnets~chain': 'Use this to compare two magnets by the chain of clips each holds.',
  's.3.life-cycles~frog': 'Use this to add the stages from egg to frog.',
  's.3.inherited-traits~environment':
    'Use this to compare plants with the same traits grown with different water.',
  's.3.adaptation-fossils~survive': 'Use this to compare how many birds of each beak survived.',
  's.3.weather-climate~range':
    'Use this for the difference between the warmest and coldest months.',
  's.3.weather-climate~flood': 'Use this to count the sandbags in a wall built in equal rows.',
};
