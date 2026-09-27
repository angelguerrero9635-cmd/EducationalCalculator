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
        { ...whole('d', 'd', 'Farther by', 0, 20), unit: 'cubes' },
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
        { ...whole('u', 'u', 'Sunny spot', 40, 100), unit: F },
        { ...whole('h', 'h', 'Shady spot', 40, 100), unit: F },
        { ...whole('w', 'w', 'Warmer by', 0, 40), unit: F },
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
        max: 100,
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
        { ...whole('s', 's', 'Start temperature', 40, 90), unit: F },
        { ...whole('r', 'r', 'Degrees warmer', 0, 40), unit: F },
        { ...whole('t', 't', 'Temperature now', 40, 100), unit: F },
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
        max: 100,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const more = moreThan('w', 'd', 'l', 'dark cup', 'light cup', ['warmer', 'cooler']);
    return {
      id: 's.K.sunlight-warms~dark-light',
      title: 'Dark or light: which warms more?',
      use: 'Use this for black and white buckets in the sun.',
      assumptions: [
        'Dark things take in more sunlight. Light things bounce more of it away.',
        'Both cups hold the same water in the same sun.',
      ],
      variables: [
        { ...whole('d', 'd', 'Dark cup', 40, 100), unit: F },
        { ...whole('l', 'l', 'Light cup', 40, 100), unit: F },
        { ...whole('w', 'w', 'Dark cup warmer by', 0, 40), unit: F },
      ],
      // The dark cup ends up at least as warm: the other way round, check the thermometers.
      relations: [{ ...more.relation, display: '{d} − {l} = {w}' }, atLeast('d', 'l')],
      steps: { ...more.steps, 'd ≥ l': {} },
      example: { d: 84, l: 76, w: 8 },
      startWith: ['d', 'l'],
      representation: {
        kind: 'thermometers',
        items: ['d', 'l'],
        difference: 'w',
        min: 40,
        max: 100,
      },
    } satisfies ModuleDef;
  })(),
  // ── Kindergarten: what plants and animals need (K-LS1-1) ──
  (() => {
    const more = moreThan('m', 'w', 'd', 'watered cup', 'dry cup', ['more', 'fewer']);
    return {
      id: 's.K.living-needs',
      assumptions: [
        'Plants need water and light. Animals need food and water.',
        'Plant 10 seeds in each cup. Water one cup only.',
        'Count the seeds that sprouted in each cup. The difference shows what water does.',
      ],
      variables: [
        whole('w', 'w', 'Seeds sprouted with water', 0, 10),
        whole('d', 'd', 'Seeds sprouted with no water', 0, 10),
        whole('m', 'm', 'More with water', 0, 10),
      ],
      // The watered cup sprouts at least as many: the other way round, count again.
      relations: [{ ...more.relation, display: '{w} − {d} = {m}' }, atLeast('w', 'd')],
      steps: { ...more.steps, 'w ≥ d': {} },
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
        'Mark the weather each school day for a month.',
      ],
      variables: [
        whole('s', 's', 'Sunny days', 0, 20),
        whole('n', 'n', 'Not sunny days', 0, 20),
        whole('d', 'd', 'Days counted', 0, 20),
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
        { ...whole('w', 'w', 'Warmer or cooler by', 0, 40), unit: F },
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
        whole('c', 'c', 'Pieces of paper', 0, 10),
        whole('p', 'p', 'Pieces picked up', 0, 20),
      ],
      relations: [all.relation],
      steps: { 'pieces = cans + paper': all.steps },
      example: { a: 4, c: 3, p: 7 },
      startWith: ['a', 'c'],
      representation: { kind: 'tally', rows: ['a', 'c'], total: 'p' },
    } satisfies ModuleDef;
  })(),
];
