/**
 * Grade 4 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 * The sort, sequence, explore and observe pages of the grade are in `../layouts/science.ts`.
 */
import type { Values } from '@/engine/types';

import { FAHRENHEIT, apart, times, whole } from '../helpers';
import type { ModuleDef } from '../types';

const F = FAHRENHEIT;

export const SCIENCE_4_MODULES: ModuleDef[] = [
  // ── Energy and speed (4-PS3-1, 4-PS3-3) ──
  (() => {
    const track = times(
      'L = v × t',
      ['v', 't', 'L'],
      ['distance each second', 'time', 'track length'],
    );
    return {
      id: 's.4.energy-speed',
      assumptions: [
        'Speed is how far something moves each second.',
        'A faster ball has more energy: it pushes a cup farther when it hits.',
        'Time the ball with a stopwatch from the first mark to the last mark.',
      ],
      variables: [
        { ...whole('L', 'L', 'Track length', 10, 500), unit: 'cm' },
        { ...whole('t', 't', 'Time', 1, 10), unit: 'seconds' },
        { ...whole('v', 'v', 'Distance each second', 1, 100), unit: 'cm' },
      ],
      relations: [track.relation],
      steps: {
        'L = v × t': {
          ...track.steps,
          v: {
            expr: '{L} ÷ {t}',
            how: 'Share the track length over the seconds: how far the ball went each second.',
          },
          t: { expr: '{L} ÷ {v}', how: 'How many seconds of that distance make the track.' },
          L: {
            expr: '{v} × {t}',
            how: 'That distance every second, for that many seconds.',
          },
        },
      },
      example: { L: 200, t: 4, v: 50 },
      startWith: ['L', 't'],
      representation: { kind: 'skipCount', step: 'v', count: 't', total: 'L' },
    } satisfies ModuleDef;
  })(),
  // ── Energy conversion: a solar oven (4-PS3-2, 4-PS3-4) ──
  (() => {
    const rise = apart(
      'r',
      'e',
      's',
      ['temperature after 30 minutes', 'temperature at the start'],
      ['warmer', 'cooler'],
      'Take the start temperature away from the temperature after 30 minutes.',
      false,
    );
    return {
      id: 's.4.energy-conversion~solar-oven',
      title: 'How much a solar oven warmed up',
      use: 'Use this to find how much a solar oven warmed up in the sun.',
      assumptions: [
        'A solar oven is a box with a clear lid. Light from the sun goes in and becomes heat.',
        'Read the thermometer at the start and again after 30 minutes in the sun.',
        'The rise is the temperature after, minus the temperature at the start.',
      ],
      variables: [
        { ...whole('s', 's', 'Temperature at the start', 40, 120), unit: F },
        { ...whole('e', 'e', 'Temperature after 30 minutes', 40, 200), unit: F },
        { ...whole('r', 'r', 'Rise', 0, 160), unit: F },
      ],
      relations: [rise.relation],
      steps: { [rise.relation.id]: rise.steps },
      example: { s: 70, e: 130, r: 60 },
      startWith: ['s', 'e'],
      representation: {
        kind: 'thermometers',
        items: ['s', 'e'],
        difference: 'r',
        min: 0,
        max: 200,
      },
    } satisfies ModuleDef;
  })(),
  // ── Waves: wavelength and amplitude (4-PS4-1) ──
  (() => {
    const rope = times(
      'R = n × w',
      ['n', 'w', 'R'],
      ['waves along the rope', 'wavelength', 'rope length'],
    );
    return {
      id: 's.4.wave-patterns',
      assumptions: [
        'A wave is a repeating pattern: crest, trough, crest.',
        'Wavelength is the distance from one crest to the next.',
        'Shake the rope faster: more waves fit along it, and each one is shorter.',
      ],
      variables: [
        { ...whole('R', 'R', 'Rope length', 10, 600), unit: 'cm' },
        whole('n', 'n', 'Waves along the rope', 1, 12),
        { ...whole('w', 'w', 'Wavelength', 1, 600), unit: 'cm' },
      ],
      relations: [rope.relation],
      steps: {
        'R = n × w': {
          ...rope.steps,
          w: {
            expr: '{R} ÷ {n}',
            how: 'Share the rope length over the waves: the length of one wave.',
          },
          n: { expr: '{R} ÷ {w}', how: 'How many wavelengths fit along the rope.' },
          R: { expr: '{n} × {w}', how: 'That many waves, each one wavelength long.' },
        },
      },
      example: { R: 200, n: 4, w: 50 },
      startWith: ['R', 'n'],
      representation: { kind: 'wave', wavelength: 'w', extent: 4 },
    } satisfies ModuleDef;
  })(),
  {
    id: 's.4.wave-patterns~amplitude',
    title: 'Amplitude from crest to trough',
    use: 'Use this to find a wave’s amplitude from its crest-to-trough height.',
    assumptions: [
      'Amplitude is how far the wave rises above the middle line.',
      'From the top of a crest to the bottom of a trough is twice the amplitude.',
      'A bigger shake makes a taller wave: more energy.',
    ],
    standalone: {
      vars: ['w'],
      why: 'The wavelength is measured along the rope; the amplitude is measured up from the middle.',
    },
    variables: [
      { ...whole('h', 'h', 'Crest to trough', 2, 60), unit: 'cm', multipleOf: 2, step: 2 },
      { ...whole('a', 'a', 'Amplitude', 1, 30), unit: 'cm' },
      { ...whole('w', 'w', 'Wavelength', 10, 100), unit: 'cm' },
    ],
    relations: [
      {
        id: 'h = 2 × a',
        display: '2 × {a} = {h}',
        vars: ['h', 'a'],
        residual: (v: Values) => v.h! - 2 * v.a!,
        solve: { h: (v: Values) => 2 * v.a!, a: (v: Values) => v.h! / 2 },
      },
    ],
    steps: {
      'h = 2 × a': {
        a: { expr: '{h} ÷ 2', how: 'Half of crest to trough is the rise above the middle.' },
        h: {
          expr: '2 × {a}',
          how: 'Up from the middle to the crest, and as far down to the trough.',
        },
      },
    },
    example: { h: 12, a: 6, w: 40 },
    startWith: ['h', 'w'],
    representation: { kind: 'wave', amplitude: 'a', wavelength: 'w', extent: 2 },
  },
  // ── Internal structures: the pulse (4-LS1-1) ──
  (() => {
    const minute = times(
      'm = b × q',
      ['b', 'q', 'm'],
      ['beats in 15 seconds', 'quarters of a minute', 'beats in a minute'],
    );
    return {
      id: 's.4.internal-structures~pulse',
      title: 'Beats per minute from a 15-second count',
      use: 'Use this to find beats per minute from a 15-second pulse count.',
      assumptions: [
        'The heart pumps blood to every part. Each pump is a beat you can feel at the wrist.',
        'A minute has four 15-second parts. Count for 15 seconds, then multiply by 4.',
        'The heart beats faster after running.',
      ],
      variables: [
        whole('b', 'b', 'Beats in 15 seconds', 5, 50),
        { ...whole('q', 'q', 'Quarters of a minute', 4, 4), allowed: [4] },
        whole('m', 'm', 'Beats in a minute', 20, 200),
      ],
      relations: [minute.relation],
      steps: {
        'm = b × q': {
          ...minute.steps,
          m: { expr: '{b} × {q}', how: 'Four 15-second counts make a minute: multiply by 4.' },
          b: { expr: '{m} ÷ {q}', how: 'A quarter of the beats in a minute.' },
          q: { expr: '{m} ÷ {b}', how: 'How many 15-second counts fit in a minute.' },
        },
      },
      example: { b: 18, q: 4, m: 72 },
      startWith: ['b', 'q'],
      representation: { kind: 'skipCount', step: 'b', count: 'q', total: 'm' },
    } satisfies ModuleDef;
  })(),
  // ── Weathering: the shake test (4-ESS2-1) ──
  (() => {
    const worn = apart(
      'w',
      'b',
      'a',
      ['mass before shaking', 'mass after shaking'],
      ['heavier', 'lighter'],
      'Take the mass after shaking away from the mass before.',
      false,
    );
    return {
      id: 's.4.weathering',
      assumptions: [
        'Weathering breaks rock into smaller pieces. Shaking rocks in a jar copies it fast.',
        'Weigh the rocks before and after. The pieces knocked off are the mass lost.',
        'Erosion moves the pieces away: water, ice, wind and roots.',
      ],
      variables: [
        { ...whole('b', 'b', 'Mass before shaking', 10, 500), unit: 'g' },
        { ...whole('a', 'a', 'Mass after shaking', 0, 500), unit: 'g' },
        { ...whole('w', 'w', 'Mass worn away', 0, 500), unit: 'g' },
      ],
      relations: [worn.relation],
      steps: { [worn.relation.id]: worn.steps },
      example: { b: 120, a: 95, w: 25 },
      startWith: ['b', 'a'],
      unitSystems: ['metric'],
      pictureLabels: ['w'],
      representation: {
        kind: 'bars',
        bars: [{ var: 'b' }, { var: 'a' }],
        min: 0,
        max: 150,
        scale: 25,
      },
    } satisfies ModuleDef;
  })(),
];
