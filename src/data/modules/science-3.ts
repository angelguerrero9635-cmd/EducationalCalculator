/**
 * Science, Grade 3 (NGSS 3-PS2, 3-LS1, 3-LS3, 3-LS4, 3-ESS2). One honest quantity model per
 * lesson, in Grade 3 math: adding within 1,000, multiplying within 100 and by tens, and
 * comparing by subtracting. Letters appear only as labels next to names.
 */
import { FAHRENHEIT, apart, sum2, sumAll, times, whole } from './helpers';
import type { Values } from '@/engine/types';

import type { ModuleDef } from './types';

const F = FAHRENHEIT;

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
        'Use a spring scale to measure one child’s pull.',
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
    const tens = {
      id: 'k = w ÷ 10',
      display: '{w} ÷ 10 = {k}',
      vars: ['k', 'w'],
      residual: (v: Values) => v.k! - v.w! / 10,
      solve: {
        k: (v: Values) => v.w! / 10,
        w: (v: Values) => v.k! * 10,
      },
    };
    return {
      id: 's.3.balanced-forces~swings',
      title: 'A pendulum’s pattern',
      assumptions: [
        'A pendulum is a weight on a string. Once it swings, it keeps a steady beat.',
        'It makes the same number of swings every 10 seconds, so you can predict the next 10.',
        'Count the tens in the seconds: 30 seconds is 3 tens.',
      ],
      variables: [
        whole('p', 'p', 'Swings in 10 seconds', 1, 20),
        { ...whole('w', 'w', 'Seconds', 10, 60), unit: 'seconds', step: 10, multipleOf: 10 },
        whole('k', 'k', 'Tens of seconds', 1, 6),
        whole('s', 's', 'Swings', 1, 120),
      ],
      relations: [tens, swings.relation],
      steps: {
        'k = w ÷ 10': {
          k: { expr: '{w} ÷ 10', how: 'Count the tens in the seconds.' },
          w: { expr: '{k} × 10', how: 'Each ten of seconds is 10 seconds.' },
        },
        's = p × k': swings.steps,
      },
      example: { p: 8, w: 30, k: 3, s: 24 },
      startWith: ['p', 'w'],
      representation: { kind: 'skipCount', step: 'p', count: 'k', total: 's' },
    } satisfies ModuleDef;
  })(),

  // ── Magnets: forces at a distance (3-PS2-3, 3-PS2-4) ──
  (() => {
    const lost = times(
      'l = s × f',
      ['s', 'f', 'l'],
      ['sheets', 'clips lost for each sheet', 'clips lost'],
      '{s} × {f} = {l}',
    );
    const left = sum2(
      'c = n − l',
      ['c', 'l', 'n'],
      ['clips lifted', 'clips lost', 'clips with no paper'],
      '{n} − {l} = {c}',
    );
    return {
      id: 's.3.magnets',
      pictureLabels: ['l'],
      assumptions: [
        'A magnet pulls on a paper clip without touching it.',
        'The pull gets weaker as the magnet gets farther away.',
        'In this test, each sheet of paper costs about the same number of clips.',
        'Use fewer sheets than it takes to drop every clip.',
      ],
      variables: [
        whole('n', 'n', 'Clips with no paper', 0, 20),
        whole('f', 'f', 'Clips lost for each sheet', 1, 5),
        whole('s', 's', 'Sheets of paper', 0, 5),
        whole('l', 'l', 'Clips lost', 0, 20),
        whole('c', 'c', 'Clips lifted', 0, 20),
      ],
      relations: [lost.relation, left.relation],
      steps: { 'l = s × f': lost.steps, 'c = n − l': left.steps },
      example: { n: 12, f: 2, s: 3, l: 6, c: 6 },
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
    const more = apart('m', 'a', 'b', ['first magnet', 'second magnet'], ['stronger', 'weaker']);
    return {
      id: 's.3.magnets~chain',
      pictureLabels: ['m'],
      title: 'Which magnet is stronger?',
      assumptions: [
        'Hang paper clips from a magnet in a chain until one drops.',
        'A stronger magnet holds a longer chain.',
      ],
      variables: [
        whole('a', 'a', 'First magnet', 0, 30),
        whole('b', 'b', 'Second magnet', 0, 30),
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
    const deeper = apart(
      'd',
      'f',
      's',
      ['fish fossil', 'shell fossil'],
      ['deeper, so older', 'higher, so younger'],
      'Take the smaller number of layers away from the bigger one.',
    );
    return {
      id: 's.3.adaptation-fossils',
      pictureLabels: ['d'],
      assumptions: [
        'A fossil is what is left of a living thing from long ago, kept in rock.',
        'Rock forms in layers, one on top of another. A deeper layer is older.',
        'A fossil with more layers above it is older than one with fewer.',
        'A fish fossil on a mountain shows the place was once under water.',
      ],
      variables: [
        whole('f', 'f', 'Layers above the fish', 0, 9),
        whole('s', 's', 'Layers above the shell', 0, 9),
        whole('d', 'd', 'Layers apart', 0, 9),
      ],
      relations: [deeper.relation],
      steps: { 'd = f and s apart': deeper.steps },
      example: { f: 2, s: 6, d: 4 },
      startWith: ['f', 's'],
      representation: { kind: 'rockLayers', fossils: ['f', 's'], difference: 'd' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const more = apart(
      'm',
      'a',
      'b',
      ['number of big-beaked birds', 'number of small-beaked birds'],
      ['more', 'fewer'],
      undefined,
      (aMore) => `more ${aMore ? 'big' : 'small'}-beaked birds survived`,
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
