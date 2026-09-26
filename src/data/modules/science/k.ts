/**
 * Kindergarten science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { FAHRENHEIT, atLeast, moreThan, sum2, whole } from '../helpers';
import type { ModuleDef } from '../types';

const F = FAHRENHEIT;

export const SCIENCE_K_MODULES: ModuleDef[] = [
  // ── Kindergarten: pushes and pulls (K-PS2-1, K-PS2-2) ──
  (() => {
    const farther = moreThan('d', 'a', 'b', 'hard push', 'gentle push', ['farther', 'shorter']);
    return {
      id: 's.K.pushes-pulls',
      assumptions: [
        'A push or a pull makes a toy car move.',
        'A hard push makes it go farther.',
        'Measure how far it rolled with cubes.',
      ],
      variables: [
        { ...whole('a', 'a', 'Hard push', 1, 20), unit: 'cubes' },
        { ...whole('b', 'b', 'Gentle push', 0, 20), unit: 'cubes' },
        { ...whole('d', 'd', 'Farther by', 0, 10), unit: 'cubes' },
      ],
      // The story fixes the order, so the sentence reads as a take-away.
      relations: [{ ...farther.relation, display: '{a} − {b} = {d}' }, atLeast('a', 'b')],
      steps: { ...farther.steps, 'a ≥ b': {} },
      example: { a: 9, b: 4, d: 5 },
      startWith: ['a', 'b'],
      representation: { kind: 'ruler', lengths: ['a', 'b'], difference: 'd', extent: 20 },
    } satisfies ModuleDef;
  })(),
  // ── Kindergarten: sunlight warms Earth's surface (K-PS3-1, K-PS3-2) ──
  (() => {
    const warmer = moreThan('w', 'u', 'h', 'sunny spot', 'shady spot', ['warmer', 'cooler']);
    return {
      id: 's.K.sunlight-warms',
      assumptions: [
        'Sunlight warms the ground, sand and water it shines on.',
        'A spot in the shade stays cooler.',
        'Put one thermometer in the sun and one in the shade. Wait 10 minutes.',
      ],
      variables: [
        { ...whole('u', 'u', 'Sunny spot', 40, 110), unit: F },
        { ...whole('h', 'h', 'Shady spot', 40, 110), unit: F },
        { ...whole('w', 'w', 'Warmer by', 0, 10), unit: F },
      ],
      // The story fixes the order, so the sentence reads as a take-away.
      relations: [{ ...warmer.relation, display: '{u} − {h} = {w}' }, atLeast('u', 'h')],
      steps: { ...warmer.steps, 'u ≥ h': {} },
      example: { u: 78, h: 72, w: 6 },
      startWith: ['u', 'h'],
      representation: {
        kind: 'thermometers',
        items: ['u', 'h'],
        difference: 'w',
        min: 40,
        max: 110,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const warms = sum2(
      'now = start + rise',
      ['s', 'r', 't'],
      ['start temperature', 'degrees warmer', 'temperature now'],
    );
    return {
      id: 's.K.sunlight-warms~warming',
      title: 'Warmer as the sun shines',
      use: 'Use this for “The water was 70 °F. It warmed 6 °F. How warm now?”',
      assumptions: [
        'Leave a cup of water in the sun. It gets warmer.',
        'Read the thermometer at the start and again later.',
      ],
      variables: [
        { ...whole('s', 's', 'Start temperature', 40, 100), unit: F },
        { ...whole('r', 'r', 'Degrees warmer', 0, 10), unit: F },
        { ...whole('t', 't', 'Temperature now', 40, 110), unit: F },
      ],
      relations: [warms.relation],
      steps: { 'now = start + rise': warms.steps },
      example: { s: 70, r: 6, t: 76 },
      startWith: ['s', 'r'],
      representation: {
        kind: 'thermometers',
        items: ['s', 't'],
        difference: 'r',
        min: 40,
        max: 110,
      },
    } satisfies ModuleDef;
  })(),
  // ── Kindergarten: what plants and animals need (K-LS1-1) ──
  (() => {
    const more = moreThan('m', 'w', 'd', 'watered cup', 'dry cup', ['more', 'fewer']);
    return {
      id: 's.K.living-needs',
      pictureLabels: ['m'],
      assumptions: [
        'Plants need water and light. Animals need food and water.',
        'Plant 10 seeds in each cup. Water one cup only.',
        'Count the seeds that sprouted in each cup. The difference shows what water does.',
      ],
      variables: [
        whole('w', 'w', 'Sprouted with water', 0, 10),
        whole('d', 'd', 'Sprouted with no water', 0, 10),
        whole('m', 'm', 'More with water', 0, 10),
      ],
      relations: [more.relation],
      steps: more.steps,
      example: { w: 8, d: 2, m: 6 },
      startWith: ['w', 'd'],
      representation: {
        kind: 'compareRows',
        a: 'w',
        b: 'd',
        difference: 'm',
        icon: 'dot',
        words: ['more', 'fewer'],
      },
    } satisfies ModuleDef;
  })(),
  // ── Kindergarten: local weather patterns (K-ESS2-1, K-ESS3-2) ──
  (() => {
    const all = sum2(
      'days = sunny + not sunny',
      ['s', 'n', 'd'],
      ['sunny days', 'days that were not sunny', 'days counted'],
    );
    return {
      id: 's.K.weather-patterns',
      assumptions: [
        'Each school day, mark the weather.',
        'Count the marks. Which weather came most?',
        'Two school weeks is 10 days.',
      ],
      variables: [
        whole('s', 's', 'Sunny days', 0, 10),
        whole('n', 'n', 'Not sunny days', 0, 10),
        whole('d', 'd', 'Days counted', 0, 10),
      ],
      relations: [all.relation],
      steps: { 'days = sunny + not sunny': all.steps },
      example: { s: 6, n: 4, d: 10 },
      startWith: ['s', 'n'],
      representation: { kind: 'tally', rows: ['s', 'n'], total: 'd' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const warmer = moreThan(
      'w',
      't',
      'y',
      'temperature today',
      'temperature yesterday',
      ['warmer', 'cooler'],
      'K1',
      'Count on from the smaller number to the bigger one. That is how many degrees apart.',
    );
    return {
      id: 's.K.weather-patterns~warmer',
      title: 'Warmer or cooler than yesterday',
      use: 'Use this for “Is today warmer or cooler than yesterday? By how much?”',
      assumptions: [
        'Read the thermometer at the same time each day.',
        'A bigger number means a warmer day.',
      ],
      variables: [
        { ...whole('t', 't', 'Today', 20, 100), unit: F },
        { ...whole('y', 'y', 'Yesterday', 20, 100), unit: F },
        { ...whole('w', 'w', 'Degrees apart', 0, 10), unit: F },
      ],
      relations: [warmer.relation],
      steps: warmer.steps,
      example: { t: 64, y: 58, w: 6 },
      startWith: ['t', 'y'],
      representation: {
        kind: 'thermometers',
        items: ['t', 'y'],
        difference: 'w',
        min: 20,
        max: 100,
      },
    } satisfies ModuleDef;
  })(),
  // ── Kindergarten: living things change their environment (K-ESS2-2, K-ESS3-3) ──
  (() => {
    const all = sum2(
      'pieces = cans + paper',
      ['a', 'c', 'p'],
      ['cans', 'pieces of paper', 'pieces picked up'],
    );
    return {
      id: 's.K.living-things-change-environment~litter',
      title: 'Cleaning up the park',
      use: 'Use this to count the litter picked up, by kind.',
      assumptions: [
        'Litter changes a place for the worse. Picking it up changes it back.',
        'Sort what you pick up, then count each kind.',
      ],
      variables: [
        whole('a', 'a', 'Cans', 0, 10),
        whole('c', 'c', 'Paper', 0, 10),
        whole('p', 'p', 'Pieces picked up', 0, 10),
      ],
      relations: [all.relation],
      steps: { 'pieces = cans + paper': all.steps },
      example: { a: 4, c: 3, p: 7 },
      startWith: ['a', 'c'],
      representation: { kind: 'tally', rows: ['a', 'c'], total: 'p' },
    } satisfies ModuleDef;
  })(),
];
