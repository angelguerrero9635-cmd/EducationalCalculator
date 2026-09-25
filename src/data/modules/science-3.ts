/**
 * Science, Grade 3 (NGSS 3-PS2, 3-LS1, 3-LS3, 3-LS4, 3-ESS2). One honest quantity model per
 * lesson, in Grade 3 math: adding within 1,000, multiplying within 100 and by tens, and
 * comparing by subtracting. Letters appear only as labels next to names.
 */
import type { Values } from '@/engine/types';

import { div, whole } from './math-k2';
import { sum2, sumAll } from './science-k2';
import type { ModuleDef, StepText } from './types';
import { divideWork, subtractStrategy, timesWork } from './work';

/** c = a × b with its two divisions, in Grade 3 words. */
function times(
  id: string,
  [a, b, c]: [string, string, string],
  [an, bn, cn]: [string, string, string],
  display = `{${a}} × {${b}} = {${c}}`,
) {
  const relation = {
    id,
    display,
    vars: [c, a, b],
    residual: (v: Values) => v[c]! - v[a]! * v[b]!,
    solve: {
      [c]: (v: Values) => v[a]! * v[b]!,
      [a]: (v: Values) => div(v[c]!, v[b]!),
      [b]: (v: Values) => div(v[c]!, v[a]!),
    },
  };
  const steps: Record<string, StepText> = {
    [c]: {
      expr: `{${a}} × {${b}}`,
      how: `Multiply the ${an} by the ${bn}.`,
      work: (v) => timesWork(v[a]!, v[b]!),
    },
    [a]: {
      expr: `{${c}} ÷ {${b}}`,
      how: `Divide the ${cn} by the ${bn}.`,
      work: (v) => divideWork(v[c]!, v[b]!),
    },
    [b]: {
      expr: `{${c}} ÷ {${a}}`,
      how: `Divide the ${cn} by the ${an}.`,
      work: (v) => divideWork(v[c]!, v[a]!, 'second'),
    },
  };
  return { relation, steps };
}

/**
 * d = how far apart a and b are (the bigger take away the smaller), whichever is bigger.
 * Knowing d and one value leaves two answers; the solver keeps the one nearest before.
 */
function apart(
  d: string,
  a: string,
  b: string,
  [an, bn]: [string, string],
  [moreWord, lessWord]: [string, string],
  howDiff = 'Take the smaller number away from the bigger one.',
) {
  const relation = {
    id: `${d} = ${a} and ${b} apart`,
    display: `{${a}} and {${b}} are {${d}} apart`,
    check: (v: Values) => `${Math.max(v[a]!, v[b]!)} − ${Math.min(v[a]!, v[b]!)} = ${v[d]}`,
    vars: [d, a, b],
    residual: (v: Values) => v[d]! - Math.abs(v[a]! - v[b]!),
    solve: {
      [d]: (v: Values) => Math.abs(v[a]! - v[b]!),
      [a]: (v: Values) => [v[b]! + v[d]!, v[b]! - v[d]!].filter((x) => x >= 0),
      [b]: (v: Values) => [v[a]! - v[d]!, v[a]! + v[d]!].filter((x) => x >= 0),
    },
  };
  const aMore = (v: Values) => v[a]! >= v[b]!;
  const steps: Record<string, StepText> = {
    [d]: {
      expr: (v) => (aMore(v) ? `{${a}} − {${b}}` : `{${b}} − {${a}}`),
      how: howDiff,
      work: (v) => subtractStrategy(Math.max(v[a]!, v[b]!), Math.min(v[a]!, v[b]!)),
      note: (v) => (v[a]! === v[b]! ? '(the same)' : `(the ${aMore(v) ? an : bn} is ${moreWord})`),
    },
    [a]: {
      expr: (v) => (aMore(v) ? `{${b}} + {${d}}` : `{${b}} − {${d}}`),
      how: (v) =>
        aMore(v)
          ? `The ${an} is ${moreWord}: add the difference to the ${bn}.`
          : `The ${an} is ${lessWord}: take the difference away from the ${bn}.`,
    },
    [b]: {
      expr: (v) => (aMore(v) ? `{${a}} − {${d}}` : `{${a}} + {${d}}`),
      how: (v) =>
        aMore(v)
          ? `The ${bn} is ${lessWord}: take the difference away from the ${an}.`
          : `The ${bn} is ${moreWord}: add the difference to the ${an}.`,
    },
  };
  return { relation, steps };
}

const F = '°F';

export const SCIENCE_3_MODULES: ModuleDef[] = [
  // ── Balanced and unbalanced forces (3-PS2-1) ──
  (() => {
    const extra = apart(
      'e',
      'r',
      'l',
      ['push to the right', 'push to the left'],
      ['bigger', 'smaller'],
      'The bigger push wins. The extra push is the bigger push take away the smaller one.',
    );
    return {
      id: 's.3.balanced-forces',
      assumptions: [
        'A force is a push or a pull. A spring scale measures it in newtons (N).',
        'Two pushes on opposite sides are balanced when they are equal: the box stays still.',
        'When one push is bigger, the box moves that way. The extra push is the difference.',
      ],
      variables: [
        { ...whole('r', 'r', 'Push to the right', 0, 100), unit: 'N' },
        { ...whole('l', 'l', 'Push to the left', 0, 100), unit: 'N' },
        { ...whole('e', 'e', 'Extra push', 0, 100), unit: 'N' },
      ],
      relations: [extra.relation],
      steps: { 'e = r and l apart': extra.steps },
      example: { r: 20, l: 15, e: 5 },
      startWith: ['r', 'l'],
      representation: { kind: 'pushes', right: 'r', left: 'l', extra: 'e', max: 40 },
    } satisfies ModuleDef;
  })(),
  (() => {
    const team = times(
      't = k × p',
      ['k', 'p', 't'],
      ['children', 'pull of each child', 'team pull'],
    );
    return {
      id: 's.3.balanced-forces~tug',
      title: 'Adding up a team’s pull',
      assumptions: [
        'In a tug of war, every child on a team pulls the same way.',
        'The team’s pull is all the pulls added: children × pull of each child.',
      ],
      variables: [
        whole('k', 'k', 'Children', 0, 10),
        { ...whole('p', 'p', 'Pull of each child', 1, 50), unit: 'N' },
        { ...whole('t', 't', 'Team pull', 0, 500), unit: 'N' },
      ],
      relations: [team.relation],
      steps: { 't = k × p': team.steps },
      example: { k: 4, p: 30, t: 120 },
      startWith: ['k', 'p'],
      representation: { kind: 'skipCount', step: 'p', count: 'k', total: 't' },
    } satisfies ModuleDef;
  })(),

  (() => {
    const swings = times(
      's = p × k',
      ['p', 'k', 's'],
      ['swings in 10 seconds', 'tens of seconds', 'swings'],
      '{p} × {k} = {s}',
    );
    return {
      id: 's.3.balanced-forces~swings',
      title: 'A pendulum’s pattern',
      assumptions: [
        'A pendulum is a weight on a string. Once it swings, it keeps a steady beat.',
        'It makes the same number of swings every 10 seconds, so you can predict the next 10.',
        'Count the tens of seconds: 30 seconds is 3 tens.',
      ],
      variables: [
        whole('p', 'p', 'Swings in 10 seconds', 1, 20),
        whole('k', 'k', 'Tens of seconds', 1, 6),
        whole('s', 's', 'Swings', 1, 120),
      ],
      relations: [swings.relation],
      steps: { 's = p × k': swings.steps },
      example: { p: 8, k: 3, s: 24 },
      startWith: ['p', 'k'],
      representation: { kind: 'skipCount', step: 'p', count: 'k', total: 's' },
    } satisfies ModuleDef;
  })(),

  // ── Magnets: forces at a distance (3-PS2-3, 3-PS2-4) ──
  (() => {
    const lost = times(
      'L = s × f',
      ['s', 'f', 'L'],
      ['sheets', 'clips lost for each sheet', 'clips lost'],
      '{s} × {f} = {L}',
    );
    const left = sum2(
      'c = n − L',
      ['c', 'L', 'n'],
      ['clips lifted', 'clips lost', 'clips with no paper'],
      '{n} − {L} = {c}',
    );
    return {
      id: 's.3.magnets',
      pictureLabels: ['L'],
      assumptions: [
        'A magnet pulls on a paper clip without touching it.',
        'The pull gets weaker as the magnet gets farther away.',
        'Each sheet of paper between them costs the same number of clips.',
        'Use fewer sheets than it takes to drop every clip.',
      ],
      variables: [
        whole('n', 'n', 'Clips with no paper', 0, 20),
        whole('f', 'f', 'Clips lost for each sheet', 1, 5),
        whole('s', 's', 'Sheets of paper', 0, 5),
        whole('L', 'L', 'Clips lost', 0, 20),
        whole('c', 'c', 'Clips lifted', 0, 20),
      ],
      relations: [lost.relation, left.relation],
      steps: { 'L = s × f': lost.steps, 'c = n − L': left.steps },
      example: { n: 12, f: 2, s: 3, L: 6, c: 6 },
      startWith: ['n', 'f', 's'],
      representation: {
        kind: 'table',
        sweep: 's',
        output: 'c',
        params: ['n', 'f'],
        rows: [0, 1, 2, 3, 4, 5],
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const more = apart('m', 'a', 'b', ['strong magnet', 'weak magnet'], ['stronger', 'weaker']);
    return {
      id: 's.3.magnets~chain',
      pictureLabels: ['m'],
      title: 'Which magnet is stronger?',
      assumptions: [
        'Hang paper clips from a magnet in a chain until one drops.',
        'A stronger magnet holds a longer chain.',
      ],
      variables: [
        whole('a', 'a', 'Strong magnet', 0, 30),
        whole('b', 'b', 'Weak magnet', 0, 30),
        whole('m', 'm', 'More clips', 0, 30),
      ],
      relations: [more.relation],
      steps: { 'm = a and b apart': more.steps },
      example: { a: 9, b: 4, m: 5 },
      startWith: ['a', 'b'],
      representation: {
        kind: 'bars',
        bars: [
          { var: 'a', editable: true },
          { var: 'b', editable: true },
        ],
        min: 0,
        max: 12,
        scale: 2,
      },
    } satisfies ModuleDef;
  })(),

  // ── Life cycles (3-LS1-1) ──
  (() => {
    const cycle = sumAll(
      'd = egg + caterpillar + chrysalis + butterfly',
      ['e', 'c', 'h', 'b'],
      'd',
      'stages',
    );
    return {
      id: 's.3.life-cycles',
      assumptions: [
        'Every animal is born, grows, has young and dies. The stages repeat: a life cycle.',
        'A butterfly is an egg, then a caterpillar, then a chrysalis, then a butterfly.',
        'Add the days of every stage to find the whole life cycle.',
      ],
      variables: [
        { ...whole('e', 'e', 'Egg', 1, 30), unit: 'days' },
        { ...whole('c', 'c', 'Caterpillar', 1, 60), unit: 'days' },
        { ...whole('h', 'h', 'Chrysalis', 1, 60), unit: 'days' },
        { ...whole('b', 'b', 'Butterfly', 1, 60), unit: 'days' },
        { ...whole('d', 'd', 'Whole cycle', 4, 210), unit: 'days' },
      ],
      relations: [cycle.relation],
      steps: { 'd = egg + caterpillar + chrysalis + butterfly': cycle.steps },
      example: { e: 4, c: 14, h: 10, b: 14, d: 42 },
      startWith: ['e', 'c', 'h', 'b'],
      representation: { kind: 'tape', parts: ['e', 'c', 'h', 'b'], total: 'd' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const cycle = sumAll('d = egg + tadpole + froglet', ['e', 't', 'f'], 'd', 'stages');
    return {
      id: 's.3.life-cycles~frog',
      title: 'From egg to frog',
      assumptions: [
        'A frog starts as an egg in the water, hatches as a tadpole, then grows legs as a froglet.',
        'Add the days of each stage to find how long it takes to become a frog.',
      ],
      variables: [
        { ...whole('e', 'e', 'Egg', 1, 30), unit: 'days' },
        { ...whole('t', 't', 'Tadpole', 1, 120), unit: 'days' },
        { ...whole('f', 'f', 'Froglet', 1, 60), unit: 'days' },
        { ...whole('d', 'd', 'Days to become a frog', 3, 210), unit: 'days' },
      ],
      relations: [cycle.relation],
      steps: { 'd = egg + tadpole + froglet': cycle.steps },
      example: { e: 10, t: 84, f: 28, d: 122 },
      startWith: ['e', 't', 'f'],
      representation: { kind: 'tape', parts: ['e', 't', 'f'], total: 'd' },
    } satisfies ModuleDef;
  })(),

  // ── Inherited traits and the environment (3-LS3-1, 3-LS3-2) ──
  (() => {
    const litter = sumAll('p = brown + black + spotted', ['b', 'k', 's'], 'p', 'fur colors');
    return {
      id: 's.3.inherited-traits',
      assumptions: [
        'A trait is something about a living thing you can observe, like fur color.',
        'Young inherit traits from their parents, but not all the young are the same.',
        'Count the puppies with each fur color.',
      ],
      variables: [
        whole('b', 'b', 'Brown', 0, 10),
        whole('k', 'k', 'Black', 0, 10),
        whole('s', 's', 'Spotted', 0, 10),
        whole('p', 'p', 'Puppies', 0, 30),
      ],
      relations: [litter.relation],
      steps: { 'p = brown + black + spotted': litter.steps },
      example: { b: 4, k: 2, s: 3, p: 9 },
      startWith: ['b', 'k', 's'],
      representation: {
        kind: 'pictureGraph',
        columns: [
          { var: 'b', icon: 'circle' },
          { var: 'k', icon: 'square' },
          { var: 's', icon: 'star' },
        ],
        max: 10,
        total: 'p',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const taller = apart('t', 'w', 'd', ['watered plant', 'dry plant'], ['taller', 'shorter']);
    return {
      id: 's.3.inherited-traits~environment',
      pictureLabels: ['t'],
      title: 'Traits the environment changes',
      assumptions: [
        'Two plants from the same seeds inherit the same traits.',
        'The environment still matters: the plant that gets more water grows taller.',
      ],
      variables: [
        { ...whole('w', 'w', 'Watered plant', 0, 60), unit: 'cm' },
        { ...whole('d', 'd', 'Dry plant', 0, 60), unit: 'cm' },
        { ...whole('t', 't', 'Taller by', 0, 60), unit: 'cm' },
      ],
      relations: [taller.relation],
      steps: { 't = w and d apart': taller.steps },
      example: { w: 32, d: 14, t: 18 },
      startWith: ['w', 'd'],
      representation: {
        kind: 'bars',
        bars: [
          { var: 'w', editable: true },
          { var: 'd', editable: true },
        ],
        min: 0,
        max: 40,
        scale: 5,
        readScale: true,
      },
    } satisfies ModuleDef;
  })(),

  // ── Adaptations, survival and fossils (3-LS4-1 to 3-LS4-4) ──
  (() => {
    const age = times(
      't = n × y',
      ['n', 'y', 't'],
      ['layers', 'thousand years for each layer', 'age of the fossil'],
      '{n} × {y} = {t}',
    );
    return {
      id: 's.3.adaptation-fossils',
      assumptions: [
        'A fossil is what is left of a living thing from long ago, kept in rock.',
        'Rock forms in layers, one on top of another. The deepest layer is the oldest.',
        'Here each layer took about the same number of thousand years to form.',
        'Type the years in tens (10, 20, 30, …), so you can count by tens.',
      ],
      variables: [
        whole('n', 'n', 'Layers above the fossil', 1, 9),
        {
          ...whole('y', 'y', 'Thousand years for each layer', 10, 100),
          unit: 'thousand years',
          step: 10,
          multipleOf: 10,
        },
        { ...whole('t', 't', 'Age of the fossil', 10, 900), unit: 'thousand years' },
      ],
      relations: [age.relation],
      steps: { 't = n × y': age.steps },
      example: { n: 6, y: 100, t: 600 },
      startWith: ['n', 'y'],
      representation: { kind: 'rockLayers', layers: 'n', years: 'y', total: 't' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const more = apart(
      'm',
      'a',
      'b',
      ['number of big-beaked birds', 'number of small-beaked birds'],
      ['more', 'fewer'],
    );
    return {
      id: 's.3.adaptation-fossils~survive',
      pictureLabels: ['m'],
      title: 'Which birds survived the dry year?',
      assumptions: [
        'In a dry year only hard seeds are left. Birds with big strong beaks can crack them.',
        'Count the birds of each kind that survived.',
      ],
      variables: [
        whole('a', 'a', 'Big-beaked birds', 0, 50),
        whole('b', 'b', 'Small-beaked birds', 0, 50),
        whole('m', 'm', 'More survived', 0, 50),
      ],
      relations: [more.relation],
      steps: { 'm = a and b apart': more.steps },
      example: { a: 27, b: 8, m: 19 },
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

  // ── Animals living in groups (3-LS2-1) ──
  (() => {
    const herd = sum2('h = a + y', ['a', 'y', 'h'], ['adults', 'young', 'animals in the herd']);
    return {
      id: 's.3.animal-groups',
      assumptions: [
        'Some animals live in groups: a herd of elephants, a pack of wolves, a hive of bees.',
        'A group helps them find food, keep the young safe and stay warm.',
        'Count the adults and the young to find the size of the group.',
      ],
      variables: [
        whole('a', 'a', 'Adults', 0, 50),
        whole('y', 'y', 'Young', 0, 50),
        whole('h', 'h', 'Animals in the herd', 0, 100),
      ],
      relations: [herd.relation],
      steps: { 'h = a + y': herd.steps },
      example: { a: 12, y: 7, h: 19 },
      startWith: ['a', 'y'],
      representation: { kind: 'tape', parts: ['a', 'y'], total: 'h' },
    } satisfies ModuleDef;
  })(),

  // ── Weather data and climate (3-ESS2-1, 3-ESS2-2, 3-ESS3-1) ──
  (() => {
    const month = sumAll(
      'm = week 1 + week 2 + week 3 + week 4',
      ['a', 'b', 'c', 'd'],
      'm',
      'weeks',
    );
    return {
      id: 's.3.weather-climate',
      assumptions: [
        'Weather is what the air is doing today: rain, wind, temperature.',
        'A rain gauge measures rain in millimeters (mm) or inches.',
        'Add the rain of each week to find the rain for the month.',
      ],
      variables: [
        { ...whole('a', 'a', 'Week 1', 0, 100), unit: 'mm' },
        { ...whole('b', 'b', 'Week 2', 0, 100), unit: 'mm' },
        { ...whole('c', 'c', 'Week 3', 0, 100), unit: 'mm' },
        { ...whole('d', 'd', 'Week 4', 0, 100), unit: 'mm' },
        { ...whole('m', 'm', 'Rain this month', 0, 400), unit: 'mm' },
      ],
      relations: [month.relation],
      steps: { 'm = week 1 + week 2 + week 3 + week 4': month.steps },
      example: { a: 12, b: 30, c: 8, d: 25, m: 75 },
      startWith: ['a', 'b', 'c', 'd'],
      representation: {
        kind: 'bars',
        bars: [
          { var: 'a', editable: true },
          { var: 'b', editable: true },
          { var: 'c', editable: true },
          { var: 'd', editable: true },
        ],
        min: 0,
        max: 40,
        scale: 10,
        total: 'm',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const range = apart('r', 'h', 'c', ['warmest month', 'coldest month'], ['warmer', 'colder']);
    return {
      id: 's.3.weather-climate~range',
      title: 'Warmest and coldest months',
      assumptions: [
        'Climate is the usual weather of a place over many years.',
        'A place with hot summers and cold winters has a big difference between its months.',
      ],
      variables: [
        { ...whole('h', 'h', 'Warmest month', 0, 120), unit: F },
        { ...whole('c', 'c', 'Coldest month', 0, 120), unit: F },
        { ...whole('r', 'r', 'Difference', 0, 120), unit: F },
      ],
      relations: [range.relation],
      steps: { 'r = h and c apart': range.steps },
      example: { h: 84, c: 28, r: 56 },
      startWith: ['h', 'c'],
      representation: {
        kind: 'thermometers',
        items: ['h', 'c'],
        difference: 'r',
        min: 0,
        max: 100,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const bags = times(
      'b = r × e',
      ['r', 'e', 'b'],
      ['rows', 'sandbags in each row', 'sandbags'],
      '{r} × {e} = {b}',
    );
    return {
      id: 's.3.weather-climate~flood',
      title: 'A sandbag wall against a flood',
      assumptions: [
        'Weather can be dangerous: floods, high winds, lightning.',
        'People build to stay safe. A wall of sandbags holds back flood water.',
        'Stack the bags in rows with the same number in each row.',
      ],
      variables: [
        whole('r', 'r', 'Rows', 1, 10),
        whole('e', 'e', 'Sandbags in each row', 1, 10),
        whole('b', 'b', 'Sandbags', 1, 100),
      ],
      relations: [bags.relation],
      steps: { 'b = r × e': bags.steps },
      example: { r: 4, e: 6, b: 24 },
      startWith: ['r', 'e'],
      representation: {
        kind: 'array',
        rows: 'r',
        columns: 'e',
        total: 'b',
        max: 10,
        cell: 'square',
      },
    } satisfies ModuleDef;
  })(),
];
