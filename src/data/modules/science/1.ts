/**
 * Grade 1 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { atLeast, moreThan, sum2, whole } from '../helpers';
import type { ModuleDef } from '../types';

export const SCIENCE_1_MODULES: ModuleDef[] = [
  // ── Grade 1: sound comes from vibrating materials (1-PS4-1, 1-PS4-4) ──
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
  // ── Grade 1: young plants and animals resemble their parents (1-LS3-1, 1-LS1-2) ──
  (() => {
    const grow = sum2(
      'p = y + g',
      ['y', 'g', 'p'],
      ['young plant', 'how much it grows', 'grown plant'],
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
        { ...whole('g', 'g', 'How much it grows', 0, 20), unit: 'cubes' },
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
  (() => {
    const shorter = moreThan('d', 'm', 'n', 'morning shadow', 'noon shadow', ['longer', 'shorter']);
    return {
      id: 's.1.sky-patterns~shadow',
      title: 'Morning and noon shadows',
      use: 'Use this to compare a shadow in the morning and at noon.',
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
      // The story fixes the order, so the sentence reads as a take-away.
      relations: [{ ...shorter.relation, display: '{m} − {n} = {d}' }, atLeast('m', 'n')],
      steps: { ...shorter.steps, 'm ≥ n': {} },
      example: { m: 12, n: 4, d: 8 },
      startWith: ['m', 'n'],
      representation: { kind: 'ruler', lengths: ['m', 'n'], difference: 'd', extent: 15 },
    } satisfies ModuleDef;
  })(),
];
