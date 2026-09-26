/**
 * Grade 3 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { FAHRENHEIT, apart, sumAll, whole } from '../helpers';
import type { ModuleDef } from '../types';

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
      undefined,
      'balanced: the box stays still',
    );
    return {
      id: 's.3.balanced-forces',
      assumptions: [
        'A force is a push or a pull. A spring scale measures it in newtons (N).',
        'Two pushes on opposite sides are balanced when they are equal: the box stays still.',
        'When one push is bigger, the box moves that way. The extra push is the difference.',
      ],
      variables: [
        { ...whole('r', 'r', 'Push to the right', 0, 50), unit: 'N' },
        { ...whole('l', 'l', 'Push to the left', 0, 50), unit: 'N' },
        { ...whole('e', 'e', 'Extra push', 0, 50), unit: 'N' },
      ],
      relations: [extra.relation],
      steps: { 'e = r and l apart': extra.steps },
      example: { r: 20, l: 15, e: 5 },
      startWith: ['r', 'l'],
      representation: { kind: 'pushes', right: 'r', left: 'l', extra: 'e', max: 40 },
    } satisfies ModuleDef;
  })(),
  // ── Magnets: forces at a distance (3-PS2-3, 3-PS2-4) ──
  (() => {
    const more = apart('m', 'a', 'b', ['first magnet', 'second magnet'], ['stronger', 'weaker']);
    return {
      id: 's.3.magnets~chain',
      pictureLabels: ['m'],
      title: 'Which magnet is stronger?',
      use: 'Use this to compare two magnets by the chain of clips each holds.',
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
  // ── Inherited traits and the environment (3-LS3-1, 3-LS3-2) ──
  (() => {
    const litter = sumAll('p = brown + black + spotted', ['b', 'k', 's'], 'p', 'fur colors');
    return {
      id: 's.3.inherited-traits~litter',
      title: 'Fur colors in a litter',
      use: 'Use this to graph a litter’s fur colors and see the variation.',
      assumptions: [
        'A trait is something about a living thing you can observe, like fur color.',
        'Young inherit traits from their parents.',
        'Puppies from the same parents are not all the same.',
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
      use: 'Use this to compare plants with the same traits grown with different water.',
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
      id: 's.3.adaptation-fossils~layers',
      title: 'Which fossil is older?',
      use: 'Use this to tell which of two fossils is older from the rock layers.',
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
      use: 'Use this to compare how many birds of each beak survived.',
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
      use: 'Use this for the difference between the warmest and coldest months.',
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
];
