/**
 * Grade 2 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { FAHRENHEIT, groupsOf, moreThan, sum2, sumAll, whole } from '../helpers';
import type { ModuleDef } from '../types';

const F = FAHRENHEIT;

export const SCIENCE_2_MODULES: ModuleDef[] = [
  // ── Grade 2: properties of materials (2-PS1-1, 2-PS1-2) ──
  (() => {
    const more = moreThan('m', 'a', 'b', 'paper towel', 'plastic sheet', ['more', 'fewer'], '2');
    return {
      id: 's.2.material-properties',
      pictureLabels: ['m'],
      assumptions: [
        'Test each material the same way: drop water on it one drop at a time.',
        'Count the drops it soaks up before water runs off.',
        'The material that soaks up more drops is better for wiping up.',
      ],
      variables: [
        { ...whole('a', 'a', 'Paper towel', 0, 50), unit: 'drops' },
        { ...whole('b', 'b', 'Plastic sheet', 0, 50), unit: 'drops' },
        { ...whole('m', 'm', 'More drops', 0, 50), unit: 'drops' },
      ],
      relations: [more.relation],
      steps: more.steps,
      example: { a: 24, b: 6, m: 18 },
      startWith: ['a', 'b'],
      representation: {
        kind: 'bars',
        bars: [
          { var: 'a', editable: true },
          { var: 'b', editable: true },
        ],
        min: 0,
        max: 30,
        scale: 5,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const used = sum2(
      'a = b + c',
      ['b', 'c', 'a'],
      ['blocks in the new house', 'blocks left over', 'blocks in the tower'],
    );
    return {
      id: 's.2.material-properties~pieces',
      title: 'Building with small pieces',
      use: 'Use this for “A 30-block tower is rebuilt as a house. How many blocks are left over?”',
      assumptions: [
        'Small pieces can be put together to make a bigger object.',
        'Take the tower apart. Build a house from the same blocks.',
        'Count the blocks in the house and the blocks left over.',
      ],
      variables: [
        whole('a', 'a', 'Blocks in the tower', 0, 50),
        whole('b', 'b', 'Blocks in the new house', 0, 50),
        whole('c', 'c', 'Blocks left over', 0, 50),
      ],
      relations: [used.relation],
      steps: { 'a = b + c': used.steps },
      example: { a: 30, b: 24, c: 6 },
      startWith: ['a', 'b'],
      representation: { kind: 'tape', parts: ['b', 'c'], total: 'a' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const changes = sum2(
      't = r + i',
      ['r', 'i', 't'],
      ['changes that can be undone', 'changes that cannot', 'changes tested'],
    );
    return {
      id: 's.2.heating-cooling',
      assumptions: [
        'Heating and cooling change things: ice melts, water freezes, an egg cooks.',
        'Melting ice and freezing water can be undone.',
        'Cooking an egg or burning paper cannot be undone.',
        'Sort each change, then count the two groups.',
      ],
      variables: [
        whole('r', 'r', 'Can be undone', 0, 10),
        whole('i', 'i', 'Cannot be undone', 0, 10),
        whole('t', 't', 'Changes tested', 0, 20),
      ],
      relations: [changes.relation],
      steps: { 't = r + i': changes.steps },
      example: { r: 4, i: 6, t: 10 },
      startWith: ['r', 'i'],
      representation: { kind: 'tally', rows: ['r', 'i'], total: 't' },
    } satisfies ModuleDef;
  })(),
  // ── Grade 2: heating and cooling (2-PS1-4) ──
  (() => {
    const warms = sum2(
      'now = start + rise',
      ['s', 'r', 't'],
      ['start temperature', 'degrees warmer', 'temperature now'],
    );
    return {
      id: 's.2.heating-cooling~warming',
      title: 'Warming up',
      use: 'Use this for “Water at 40 °F warms 35 °F. How warm is it now?”',
      assumptions: [
        'Heating makes the thermometer number go up. Cooling makes it go down.',
        'Ice melts at 32 °F. Water boils at 212 °F.',
      ],
      variables: [
        { ...whole('s', 's', 'Start temperature', 0, 212), unit: F },
        { ...whole('r', 'r', 'Degrees warmer', 0, 100), unit: F },
        { ...whole('t', 't', 'Temperature now', 0, 212), unit: F },
      ],
      relations: [warms.relation],
      steps: { 'now = start + rise': warms.steps },
      example: { s: 40, r: 35, t: 75 },
      startWith: ['s', 'r'],
      representation: {
        kind: 'thermometers',
        items: ['s', 't'],
        difference: 'r',
        min: 0,
        max: 100,
        marks: [32],
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const cools = sum2(
      'later = now − drop',
      ['l', 'c', 'n'],
      ['temperature later', 'degrees cooler', 'temperature now'],
      '{n} − {c} = {l}',
    );
    return {
      id: 's.2.heating-cooling~cooling',
      title: 'Cooling down',
      use: 'Use this for “Water at 68 °F cools 36 °F. How cold is it now?”',
      assumptions: [
        'In the freezer, water cools until it freezes at 32 °F.',
        'Take the degrees it cools away from the temperature now.',
      ],
      variables: [
        { ...whole('n', 'n', 'Temperature now', 0, 212), unit: F },
        { ...whole('c', 'c', 'Degrees cooler', 0, 100), unit: F },
        { ...whole('l', 'l', 'Temperature later', 0, 212), unit: F },
      ],
      relations: [cools.relation],
      steps: { 'later = now − drop': cools.steps },
      example: { n: 68, c: 36, l: 32 },
      startWith: ['n', 'c'],
      representation: {
        kind: 'thermometers',
        items: ['n', 'l'],
        difference: 'c',
        min: 0,
        max: 100,
        marks: [32],
      },
    } satisfies ModuleDef;
  })(),
  // ── Grade 2: what plants need to grow (2-LS2-1) ──
  (() => {
    const taller = moreThan(
      'd',
      's',
      'h',
      'plant in the sun',
      'plant in the shade',
      ['taller', 'shorter'],
      '2',
    );
    return {
      id: 's.2.plant-growth-investigation',
      assumptions: [
        'Grow two plants the same way, except one gets sunlight and one does not.',
        'Water both the same. Measure them after two weeks.',
        'The difference shows what sunlight does.',
      ],
      variables: [
        { ...whole('s', 's', 'Plant in the sun', 0, 50), unit: 'cm' },
        { ...whole('h', 'h', 'Plant in the shade', 0, 50), unit: 'cm' },
        { ...whole('d', 'd', 'Taller by', 0, 50), unit: 'cm' },
      ],
      relations: [taller.relation],
      steps: taller.steps,
      example: { s: 24, h: 9, d: 15 },
      startWith: ['s', 'h'],
      representation: { kind: 'ruler', lengths: ['s', 'h'], difference: 'd', extent: 30 },
    } satisfies ModuleDef;
  })(),
  (() => {
    const taller = moreThan(
      'd',
      'w',
      'n',
      'watered plant',
      'dry plant',
      ['taller', 'shorter'],
      '2',
    );
    return {
      id: 's.2.plant-growth-investigation~water',
      title: 'Water or no water',
      use: 'Use this for “The watered plant is 22 cm, the dry one 8 cm. How much taller?”',
      assumptions: [
        'Grow two plants the same way, except one gets water and one does not.',
        'Give both the same light. Measure them after two weeks.',
        'The difference shows what water does.',
      ],
      variables: [
        { ...whole('w', 'w', 'Watered plant', 0, 50), unit: 'cm' },
        { ...whole('n', 'n', 'Dry plant', 0, 50), unit: 'cm' },
        { ...whole('d', 'd', 'Taller by', 0, 50), unit: 'cm' },
      ],
      relations: [taller.relation],
      steps: taller.steps,
      example: { w: 22, n: 8, d: 14 },
      startWith: ['w', 'n'],
      representation: { kind: 'ruler', lengths: ['w', 'n'], difference: 'd', extent: 30 },
    } satisfies ModuleDef;
  })(),
  (() => {
    const grew = sum2(
      'now = start + growth',
      ['s', 'g', 'n'],
      ['height at the start', 'growth', 'height now'],
    );
    return {
      id: 's.2.plant-growth-investigation~week',
      title: 'How much a plant grew',
      use: 'Use this for “The plant was 18 cm. Now it is 25 cm. How much did it grow?”',
      assumptions: [
        'Measure the plant at the start of the week and at the end.',
        'The growth is how much taller it got.',
      ],
      variables: [
        { ...whole('s', 's', 'Height at the start', 0, 50), unit: 'cm' },
        { ...whole('g', 'g', 'Growth', 0, 50), unit: 'cm' },
        { ...whole('n', 'n', 'Height now', 0, 100), unit: 'cm' },
      ],
      relations: [grew.relation],
      steps: { 'now = start + growth': grew.steps },
      example: { s: 18, g: 7, n: 25 },
      startWith: ['s', 'n'],
      representation: {
        kind: 'hops',
        start: 's',
        hops: [{ var: 'g', sign: 1 }],
        end: 'n',
        min: 0,
        max: 50,
        tick: 5,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const all = sumAll('seeds = fur + wind + fell', ['a', 'b', 'c'], 's', 'ways the seeds went');
    return {
      id: 's.2.pollination-dispersal',
      assumptions: [
        'Animals and wind move seeds and pollen. Plants need that to grow in new places.',
        'Seeds travel: some stick to fur, some blow away, some just fall.',
        'Seeds that travel can grow in new places.',
      ],
      variables: [
        whole('a', 'a', 'Stuck to fur', 0, 50),
        whole('b', 'b', 'Blown by the wind', 0, 50),
        whole('c', 'c', 'Fell under the plant', 0, 50),
        whole('s', 's', 'Seeds', 0, 100),
      ],
      relations: [all.relation],
      steps: { 'seeds = fur + wind + fell': all.steps },
      example: { a: 8, b: 15, c: 22, s: 45 },
      startWith: ['a', 'b', 'c'],
      representation: { kind: 'tape', parts: ['a', 'b', 'c'], total: 's' },
    } satisfies ModuleDef;
  })(),
  // ── Grade 2: pollination and seed dispersal (2-LS2-2) ──
  (() => {
    const visits = sum2(
      'f = a + b',
      ['a', 'b', 'f'],
      ['morning visits', 'afternoon visits', 'visits in all'],
    );
    return {
      id: 's.2.pollination-dispersal~visits',
      title: 'A bee’s visits',
      use: 'Use this to count a bee’s visits in the morning and the afternoon.',
      assumptions: [
        'A bee carries pollen from flower to flower. That is pollination.',
        'Count the visits in the morning and in the afternoon.',
      ],
      variables: [
        whole('a', 'a', 'Morning visits', 0, 100),
        whole('b', 'b', 'Afternoon visits', 0, 100),
        whole('f', 'f', 'Visits in all', 0, 100),
      ],
      relations: [visits.relation],
      steps: { 'f = a + b': visits.steps },
      example: { a: 36, b: 27, f: 63 },
      startWith: ['a', 'b'],
      representation: { kind: 'tape', parts: ['a', 'b'], total: 'f' },
    } satisfies ModuleDef;
  })(),
  // ── Grade 2: biodiversity in habitats (2-LS4-1) ──
  (() => {
    const more = moreThan('m', 'p', 'd', 'pond', 'desert', ['more', 'fewer'], '2');
    return {
      id: 's.2.habitats',
      pictureLabels: ['m'],
      assumptions: [
        'A habitat is where living things get what they need.',
        'Different habitats have different kinds of plants and animals.',
        'Count the kinds you find in each habitat.',
      ],
      variables: [
        whole('p', 'p', 'Kinds in the pond', 0, 50),
        whole('d', 'd', 'Kinds in the desert', 0, 50),
        whole('m', 'm', 'More kinds', 0, 50),
      ],
      relations: [more.relation],
      steps: more.steps,
      example: { p: 18, d: 7, m: 11 },
      startWith: ['p', 'd'],
      representation: {
        kind: 'bars',
        bars: [
          { var: 'p', editable: true },
          { var: 'd', editable: true },
        ],
        min: 0,
        max: 20,
        scale: 5,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const all = sumAll(
      'animals = frogs + fish + insects',
      ['f', 'h', 'i'],
      'n',
      'kinds of animals',
    );
    return {
      id: 's.2.habitats~pond-count',
      title: 'Animals seen at the pond',
      use: 'Use this to count the animals seen in one habitat, by kind.',
      assumptions: [
        'Sit still and count each animal you see.',
        'Put each animal in its group, then add the groups.',
      ],
      variables: [
        whole('f', 'f', 'Frogs', 0, 10),
        whole('h', 'h', 'Fish', 0, 10),
        whole('i', 'i', 'Insects', 0, 10),
        whole('n', 'n', 'Animals', 0, 30),
      ],
      relations: [all.relation],
      steps: { 'animals = frogs + fish + insects': all.steps },
      example: { f: 3, h: 6, i: 9, n: 18 },
      startWith: ['f', 'h', 'i'],
      representation: {
        kind: 'pictureGraph',
        columns: [
          { var: 'f', icon: 'circle' },
          { var: 'h', icon: 'triangle' },
          { var: 'i', icon: 'star' },
        ],
        max: 10,
        total: 'n',
      },
    } satisfies ModuleDef;
  })(),
  // ── Grade 2: landforms and Earth changes (2-ESS1-1, 2-ESS2-1, 2-ESS2-2) ──
  (() => {
    const g = groupsOf(
      't = y years of e',
      ['y', 'e', 't'],
      ['year', 'years'],
      ['centimeter', 'centimeters'],
    );
    return {
      id: 's.2.erosion-landforms',
      assumptions: [
        'Some changes are fast: an earthquake. Some are slow: a river wearing away its bank.',
        'The river takes about the same amount of bank each year.',
        'Count by that amount, once for each year.',
      ],
      variables: [
        whole('y', 'y', 'Years', 0, 10),
        whole('e', 'e', 'Centimeters worn away each year', 1, 10),
        whole('t', 't', 'Centimeters worn away in all', 0, 100),
      ],
      relations: [g.relation],
      steps: { 't = y years of e': g.steps },
      example: { y: 4, e: 5, t: 20 },
      startWith: ['y', 'e'],
      representation: { kind: 'skipCount', step: 'e', count: 'y', total: 't' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const saved = moreThan(
      'd',
      'a',
      'b',
      'bank with no wall',
      'bank with a wall',
      ['more', 'less'],
      '2',
    );
    return {
      id: 's.2.erosion-landforms~wall',
      pictureLabels: ['d'],
      title: 'Slowing erosion with a wall',
      use: 'Use this to compare soil lost with and without a wall.',
      assumptions: [
        'People build walls and plant grass to slow down erosion.',
        'Measure how much soil each bank lost in the same rain.',
        'The difference is the soil the wall saved.',
      ],
      variables: [
        { ...whole('a', 'a', 'Lost with no wall', 0, 100), unit: 'cm' },
        { ...whole('b', 'b', 'Lost with a wall', 0, 100), unit: 'cm' },
        { ...whole('d', 'd', 'Soil saved', 0, 100), unit: 'cm' },
      ],
      relations: [saved.relation],
      steps: saved.steps,
      example: { a: 30, b: 8, d: 22 },
      startWith: ['a', 'b'],
      representation: {
        kind: 'bars',
        bars: [
          { var: 'a', editable: true },
          { var: 'b', editable: true },
        ],
        min: 0,
        max: 40,
        scale: 10,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const water = sum2('w = s + f', ['s', 'f', 'w'], ['salty cups', 'fresh cups', 'cups of water']);
    return {
      id: 's.2.water-on-earth',
      assumptions: [
        'Most of Earth’s water is salty ocean water. Only a little is fresh.',
        'Picture Earth’s water as 100 cups: about 97 are salty and 3 are fresh.',
        'Fresh water is in ice, rivers, lakes and under the ground.',
      ],
      variables: [
        { ...whole('s', 's', 'Salty', 0, 100), unit: 'cups' },
        { ...whole('f', 'f', 'Fresh', 0, 100), unit: 'cups' },
        { ...whole('w', 'w', 'All the water', 0, 100), unit: 'cups' },
      ],
      relations: [water.relation],
      steps: { 'w = s + f': water.steps },
      example: { s: 97, f: 3, w: 100 },
      startWith: ['s', 'f'],
      representation: { kind: 'tape', parts: ['s', 'f'], total: 'w' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const all = sumAll('fresh = ice + rivers + ground', ['i', 'r', 'g'], 'f', 'places');
    return {
      id: 's.2.water-on-earth~fresh',
      title: 'Where the fresh water is',
      use: 'Use this to see where Earth’s fresh water is: ice, rivers and lakes, or under the ground.',
      assumptions: [
        'Most fresh water is frozen in ice. Much of the rest is under the ground.',
        'Rivers and lakes hold only a little.',
        'Picture the fresh water as 100 cups.',
      ],
      variables: [
        { ...whole('i', 'i', 'In ice', 0, 100), unit: 'cups' },
        { ...whole('r', 'r', 'In rivers and lakes', 0, 100), unit: 'cups' },
        { ...whole('g', 'g', 'Under the ground', 0, 100), unit: 'cups' },
        { ...whole('f', 'f', 'Fresh water', 0, 100), unit: 'cups' },
      ],
      relations: [all.relation],
      steps: { 'fresh = ice + rivers + ground': all.steps },
      example: { i: 69, r: 1, g: 30, f: 100 },
      startWith: ['i', 'r', 'g'],
      representation: { kind: 'tape', parts: ['i', 'r', 'g'], total: 'f' },
    } satisfies ModuleDef;
  })(),
];
