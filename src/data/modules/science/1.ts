/**
 * Grade 1 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { moreThan, sum2, whole } from '../helpers';
import type { ModuleDef } from '../types';
import { countUp, subtractStrategy } from '../work';

export const SCIENCE_1_MODULES: ModuleDef[] = [
  // ── Grade 1: sound comes from vibrating materials (1-PS4-1, 1-PS4-4) ──
  (() => {
    const longer = moreThan('d', 'a', 'b', 'long part', 'short part', ['longer', 'shorter']);
    return {
      id: 's.1.sound-vibration',
      assumptions: [
        'A sound comes from something wiggling back and forth: vibrating.',
        'Hold a ruler on the desk with part sticking out. Twang it.',
        'A long part wiggles slowly and sounds low. A short part wiggles fast and sounds high.',
      ],
      variables: [
        { ...whole('a', 'a', 'Long part', 0, 30), unit: 'cm' },
        { ...whole('b', 'b', 'Short part', 0, 30), unit: 'cm' },
        { ...whole('d', 'd', 'Longer by', 0, 30), unit: 'cm' },
      ],
      relations: [longer.relation],
      steps: longer.steps,
      example: { a: 20, b: 8, d: 12 },
      startWith: ['a', 'b'],
      representation: { kind: 'ruler', lengths: ['a', 'b'], difference: 'd', extent: 30 },
    } satisfies ModuleDef;
  })(),
  (() => {
    const more = moreThan('m', 'a', 'b', 'loud hit', 'soft hit', ['more', 'fewer']);
    return {
      id: 's.1.sound-vibration~drum',
      title: 'Sound makes things move',
      use: 'Use this for “Which hit made more rice jump? How many more?”',
      assumptions: [
        'Put rice on a drum. Hit the drum and the rice jumps.',
        'A loud sound makes the drum vibrate more, so more rice jumps.',
        'Count the grains that jumped off.',
      ],
      variables: [
        whole('a', 'a', 'Loud hit', 0, 20),
        whole('b', 'b', 'Soft hit', 0, 20),
        whole('m', 'm', 'More grains', 0, 20),
      ],
      relations: [more.relation],
      steps: more.steps,
      example: { a: 14, b: 5, m: 9 },
      startWith: ['a', 'b'],
      pictureLabels: ['m'],
      representation: {
        kind: 'bars',
        bars: [
          { var: 'a', editable: true },
          { var: 'b', editable: true },
        ],
        min: 0,
        max: 20,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const shorter = moreThan('d', 'm', 'n', 'morning shadow', 'noon shadow', ['longer', 'shorter']);
    return {
      id: 's.1.light-shadows',
      assumptions: [
        'A shadow forms where an object blocks the light.',
        'When the sun is low, shadows are long. At noon they are short.',
        'Try it: a low flashlight makes a long shadow. A high one makes a short shadow.',
      ],
      variables: [
        { ...whole('m', 'm', 'Morning shadow', 0, 15), unit: 'cubes' },
        { ...whole('n', 'n', 'Noon shadow', 0, 15), unit: 'cubes' },
        { ...whole('d', 'd', 'Longer by', 0, 15), unit: 'cubes' },
      ],
      relations: [shorter.relation],
      steps: shorter.steps,
      example: { m: 12, n: 4, d: 8 },
      startWith: ['m', 'n'],
      representation: { kind: 'ruler', lengths: ['m', 'n'], difference: 'd', extent: 15 },
    } satisfies ModuleDef;
  })(),
  // ── Grade 1: young plants and animals resemble their parents (1-LS3-1) ──
  (() => {
    const litter = sum2(
      'n = a + b',
      ['a', 'b', 'n'],
      ['spotted puppies', 'puppies that are not spotted', 'puppies'],
    );
    return {
      id: 's.1.offspring',
      assumptions: [
        'Young animals look like their parents, but not exactly the same.',
        'Some puppies have the mother’s spots. Some do not.',
      ],
      variables: [
        whole('a', 'a', 'Spotted like the mother', 0, 10),
        whole('b', 'b', 'Not spotted', 0, 10),
        whole('n', 'n', 'Puppies', 0, 10),
      ],
      relations: [litter.relation],
      steps: { 'n = a + b': litter.steps },
      example: { a: 4, b: 2, n: 6 },
      startWith: ['a', 'b'],
      representation: { kind: 'tenFrame', first: 'a', second: 'b', total: 'n' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const grow = sum2(
      'p = y + g',
      ['y', 'g', 'p'],
      ['young plant', 'cubes it grows', 'grown plant'],
    );
    return {
      id: 's.1.offspring~grow',
      title: 'A young plant grows to its parent’s size',
      use: 'Use this for “The young plant is 5 cubes. How much more to be like its parent?”',
      assumptions: [
        'A young plant is small. It grows to look like its parent.',
        'Measure the young plant now and the grown plant.',
      ],
      variables: [
        { ...whole('y', 'y', 'Young plant', 0, 20), unit: 'cubes' },
        { ...whole('g', 'g', 'Cubes it grows', 0, 20), unit: 'cubes' },
        { ...whole('p', 'p', 'Grown plant', 0, 20), unit: 'cubes' },
      ],
      relations: [grow.relation],
      steps: { 'p = y + g': grow.steps },
      example: { y: 5, g: 9, p: 14 },
      startWith: ['y', 'p'],
      representation: {
        kind: 'hops',
        start: 'y',
        hops: [{ var: 'g', sign: 1 }],
        end: 'p',
        min: 0,
        max: 20,
      },
    } satisfies ModuleDef;
  })(),
  // ── Grade 1: patterns of the sun, moon and stars (1-ESS1-1, 1-ESS1-2) ──
  (() => {
    const more = moreThan('m', 's', 'w', 'summer day', 'winter day', ['more', 'fewer']);
    return {
      id: 's.1.sky-patterns',
      pictureLabels: ['m'],
      assumptions: [
        'Daylight is the time from sunrise to sunset.',
        'Summer days have more hours of daylight than winter days.',
        'Count the hours from sunrise to sunset.',
      ],
      variables: [
        { ...whole('s', 's', 'Summer daylight', 0, 20), unit: 'hours' },
        { ...whole('w', 'w', 'Winter daylight', 0, 20), unit: 'hours' },
        { ...whole('m', 'm', 'More hours', 0, 20), unit: 'hours' },
      ],
      relations: [more.relation],
      steps: more.steps,
      example: { s: 15, w: 9, m: 6 },
      startWith: ['s', 'w'],
      representation: {
        kind: 'bars',
        bars: [
          { var: 's', editable: true },
          { var: 'w', editable: true },
        ],
        min: 0,
        max: 20,
        scale: 5,
      },
    } satisfies ModuleDef;
  })(),
  {
    id: 's.1.sky-patterns~moon',
    title: 'Days until the full moon',
    use: 'Use this for “It is 6 days since the new moon. How long until it is full?”',
    assumptions: [
      'The moon’s shape changes in a pattern that repeats.',
      'After a new moon it looks a little bigger each night. In about 15 days it is full.',
    ],
    variables: [
      whole('p', 'p', 'Days since new moon', 0, 15),
      whole('l', 'l', 'Days to full moon', 0, 15),
    ],
    relations: [
      {
        id: 'p + l = 15',
        display: '{p} + {l} = 15',
        vars: ['p', 'l'],
        residual: (v) => v.p! + v.l! - 15,
        solve: { p: (v) => 15 - v.l!, l: (v) => 15 - v.p! },
      },
    ],
    steps: {
      'p + l = 15': {
        l: {
          expr: '15 − {p}',
          how: 'Count up from the days passed to 15.',
          work: (v) => countUp(v.p!, 15),
        },
        p: {
          expr: '15 − {l}',
          how: 'Take the days still to go away from 15.',
          work: (v) => subtractStrategy(15, v.l!),
        },
      },
    },
    example: { p: 6, l: 9 },
    startWith: ['p'],
    representation: { kind: 'tenFrame', first: 'p', second: 'l', total: 15, frames: 2 },
  },
  (() => {
    const longer = moreThan('d', 'a', 'b', 'long beak', 'short beak', ['longer', 'shorter']);
    return {
      id: 's.1.structures-function~beaks',
      title: 'Beaks shaped for their food',
      use: 'Use this to compare two beaks and say which food each fits.',
      assumptions: [
        'A long thin beak reaches nectar deep in a flower.',
        'A short strong beak cracks seeds.',
        'Measure the beaks in centimeters.',
      ],
      variables: [
        { ...whole('a', 'a', 'Long beak', 0, 20), unit: 'cm' },
        { ...whole('b', 'b', 'Short beak', 0, 20), unit: 'cm' },
        { ...whole('d', 'd', 'Longer by', 0, 20), unit: 'cm' },
      ],
      relations: [longer.relation],
      steps: longer.steps,
      example: { a: 9, b: 2, d: 7 },
      startWith: ['a', 'b'],
      representation: { kind: 'ruler', lengths: ['a', 'b'], difference: 'd', extent: 20 },
    } satisfies ModuleDef;
  })(),
];
