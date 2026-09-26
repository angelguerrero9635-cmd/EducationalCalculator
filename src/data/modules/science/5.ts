/**
 * Grade 5 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 * The sort, sequence, explore and observe pages of the grade are in `../layouts/science.ts`.
 */
import { formatNumber } from '@/engine/format';
import type { Values } from '@/engine/types';

import { minus, sumAll, times, whole } from '../helpers';
import type { ModuleDef } from '../types';

const fmt = (x: number) => formatNumber(x);

export const SCIENCE_5_MODULES: ModuleDef[] = [
  // ── Conservation of mass (5-PS1-2) ──
  (() => {
    const total = sumAll('B = w + s + c', ['w', 's', 'c'], 'B', 'masses on the scale');
    return {
      id: 's.5.conservation-mass',
      assumptions: [
        'Weigh the cup, the water and the salt together, then stir until the salt disappears.',
        'The scale reads the same after stirring. Dissolving hides the salt but does not remove it.',
        'Melting, freezing or heating in a closed container also keeps the total mass the same.',
      ],
      variables: [
        { ...whole('w', 'w', 'Water', 100, 500), unit: 'g' },
        { ...whole('s', 's', 'Salt', 1, 30), unit: 'g' },
        { ...whole('c', 'c', 'Cup', 5, 100), unit: 'g' },
        { ...whole('B', 'B', 'Total on the scale', 106, 630), unit: 'g' },
      ],
      relations: [total.relation],
      steps: { 'B = w + s + c': total.steps },
      example: { w: 200, s: 20, c: 30, B: 250 },
      startWith: ['w', 's', 'c'],
      unitSystems: ['metric'],
      pictureLabels: ['B'],
      representation: { kind: 'scale', items: ['w', 's', 'c'], total: 'B', max: 800 },
    } satisfies ModuleDef;
  })(),
  (() => {
    const before = sumAll('B = d + v + c', ['d', 'v', 'c'], 'B', 'masses on the scale');
    const gas = minus(
      'g = B − A',
      ['g', 'B', 'A'],
      [
        'The mass that is missing after the fizz is the gas that floated away.',
        'Add the escaped gas back to the mass after.',
        'Take the escaped gas away from the mass before.',
      ],
    );
    return {
      id: 's.5.conservation-mass~fizz',
      title: 'Gas that escaped from a fizz',
      use: 'Use this to find how much gas escaped when baking soda met vinegar in an open cup.',
      assumptions: [
        'Baking soda and vinegar make a gas: the fizz.',
        'In an open cup the gas floats away, so the scale reads less.',
        'In a sealed bag the gas stays, and the mass does not change.',
      ],
      variables: [
        { ...whole('d', 'd', 'Baking soda', 1, 20), unit: 'g' },
        { ...whole('v', 'v', 'Vinegar', 20, 300), unit: 'g' },
        { ...whole('c', 'c', 'Cup', 5, 100), unit: 'g' },
        { ...whole('B', 'B', 'Total before', 26, 420), unit: 'g', derived: true },
        { ...whole('A', 'A', 'Total after', 1, 450), unit: 'g' },
        { ...whole('g', 'g', 'Gas that escaped', 0, 10), unit: 'g' },
      ],
      relations: [before.relation, gas.relation],
      steps: { 'B = d + v + c': before.steps, 'g = B − A': gas.steps },
      example: { d: 10, v: 100, c: 30, B: 140, A: 137, g: 3 },
      startWith: ['d', 'v', 'c', 'A'],
      unitSystems: ['metric'],
      pictureLabels: ['B'],
      representation: {
        kind: 'waterfall',
        items: [
          { var: 'd', sign: 1 },
          { var: 'v', sign: 1 },
          { var: 'c', sign: 1 },
          { var: 'g', sign: -1 },
        ],
        total: 'A',
      },
    } satisfies ModuleDef;
  })(),
  // ── Gravity: the pull on washers on a spring scale (5-PS2-1) ──
  (() => {
    const stack = times(
      'p = n × e',
      ['n', 'e', 'p'],
      ['washers', 'pull on one washer', 'pull on the stack'],
    );
    return {
      id: 's.5.gravity-down~spring-scale',
      title: 'The pull on a stack of washers',
      use: 'Use this to find the pull of gravity on a stack of the same washers.',
      assumptions: [
        'Gravity pulls every washer down. A spring scale measures the pull in newtons (N).',
        'Each washer is pulled the same. More washers, more pull.',
        'One newton is about the pull of gravity on a small apple.',
      ],
      variables: [
        whole('n', 'n', 'Washers', 1, 20),
        {
          id: 'e',
          symbol: 'e',
          name: 'Pull on one washer',
          unit: 'N',
          min: 0.1,
          max: 2,
          step: 0.1,
        },
        {
          id: 'p',
          symbol: 'p',
          name: 'Pull on the stack',
          unit: 'N',
          min: 0.1,
          max: 40,
          step: 0.1,
        },
      ],
      relations: [stack.relation],
      steps: {
        'p = n × e': {
          p: {
            expr: '{n} × {e}',
            how: 'The same pull for every washer: multiply by the washers.',
            work: (v: Values) => {
              const tenths = Math.round(v.e! * 10);
              return [
                `${v.n} × ${tenths} tenths = ${v.n! * tenths} tenths`,
                `${v.n! * tenths} tenths = ${fmt(v.p!)}`,
              ];
            },
          },
          n: { expr: '{p} ÷ {e}', how: 'Divide the pull on the stack by the pull on one washer.' },
          e: {
            expr: '{p} ÷ {n}',
            how: 'Divide the pull on the stack by the number of washers.',
            work: (v: Values) => {
              const tenths = Math.round(v.p! * 10);
              return Number.isInteger(tenths / v.n!)
                ? [
                    `${fmt(v.p!)} = ${tenths} tenths`,
                    `${tenths} ÷ ${v.n} = ${tenths / v.n!} tenths = ${fmt(v.e!)}`,
                  ]
                : [];
            },
          },
        },
      },
      example: { n: 6, e: 0.5, p: 3 },
      startWith: ['n', 'e'],
      unitSystems: ['metric'],
      representation: {
        kind: 'table',
        sweep: 'n',
        output: 'p',
        params: ['e'],
        rows: [1, 2, 4, 6, 8, 10, 12, 16, 20],
      },
    } satisfies ModuleDef;
  })(),
  // ── Plants get their mass from air and water (5-LS1-1) ──
  (() => {
    const gain = minus(
      'g = E − S',
      ['g', 'E', 'S'],
      [
        'The plant at the end minus the plant at the start: what it gained.',
        'The plant at the start plus what it gained.',
        'The plant at the end minus what it gained.',
      ],
    );
    const loss = minus(
      'l = T − U',
      ['l', 'T', 'U'],
      [
        'The dry soil at the start minus the dry soil at the end: what the soil lost.',
        'The soil at the end plus what it lost.',
        'The soil at the start minus what it lost.',
      ],
    );
    const rest = minus(
      'r = g − l',
      ['r', 'g', 'l'],
      [
        'Even if all the lost soil went into the plant, the rest came from somewhere else.',
        'What did not come from the soil, plus the soil lost.',
        'What the plant gained, minus what did not come from the soil.',
      ],
    );
    return {
      id: 's.5.plants-sunlight-energy',
      assumptions: [
        'Weigh the plant and the dried soil at the start and again weeks later.',
        'The plant gains far more than the soil loses. Most of its new mass came from water and air.',
        'Sunlight gives the energy to turn air and water into the plant’s food.',
      ],
      variables: [
        { ...whole('S', 'S', 'Plant at the start', 1, 200), unit: 'g' },
        { ...whole('E', 'E', 'Plant at the end', 1, 2000), unit: 'g' },
        { ...whole('g', 'g', 'Plant gain', 0, 2000), unit: 'g', derived: true },
        { ...whole('T', 'T', 'Soil at the start', 100, 5000), unit: 'g' },
        { ...whole('U', 'U', 'Soil at the end', 50, 5000), unit: 'g' },
        { ...whole('l', 'l', 'Soil lost', 0, 50), unit: 'g', derived: true },
        { ...whole('r', 'r', 'Gain not from the soil', 0, 2000), unit: 'g' },
      ],
      relations: [gain.relation, loss.relation, rest.relation],
      steps: { 'g = E − S': gain.steps, 'l = T − U': loss.steps, 'r = g − l': rest.steps },
      example: { S: 5, E: 85, g: 80, T: 1000, U: 998, l: 2, r: 78 },
      startWith: ['S', 'E', 'T', 'U'],
      unitSystems: ['metric'],
      representation: {
        kind: 'bars',
        bars: [{ var: 'g' }, { var: 'l' }, { var: 'r' }],
        min: 0,
        max: 100,
        scale: 10,
      },
    } satisfies ModuleDef;
  })(),
  // ── Earth's water: salt, frozen and liquid fresh water (5-ESS2-2) ──
  {
    id: 's.5.earth-spheres~water-share',
    title: 'How much of Earth’s water is fresh',
    use: 'Use this to split Earth’s water into salt water, frozen fresh water and liquid fresh water.',
    assumptions: [
      'About 97 of every 100 liters of Earth’s water are salty ocean water.',
      'About 2 of every 3 liters of fresh water are frozen in ice at the poles and on mountains.',
      'Most liquid fresh water is under the ground. Lakes and rivers hold very little.',
    ],
    variables: [
      {
        ...whole('w', 'w', 'All the water', 100, 10000),
        unit: 'liters',
        allowed: [100, 1000, 10000],
      },
      { ...whole('s', 's', 'Salt water', 97, 9700), unit: 'liters' },
      { ...whole('f', 'f', 'Fresh water', 3, 300), unit: 'liters', derived: true },
      { ...whole('i', 'i', 'Frozen fresh water', 2, 200), unit: 'liters' },
      { ...whole('l', 'l', 'Liquid fresh water', 1, 100), unit: 'liters' },
    ],
    relations: [
      {
        id: 's = w × 97 ÷ 100',
        display: '{w} × 97 ÷ 100 = {s}',
        vars: ['s', 'w'],
        residual: (v: Values) => v.s! - (v.w! * 97) / 100,
        solve: { s: (v: Values) => (v.w! * 97) / 100, w: (v: Values) => (v.s! * 100) / 97 },
      },
      {
        id: 'f = w − s',
        display: '{w} − {s} = {f}',
        vars: ['f', 'w', 's'],
        residual: (v: Values) => v.f! - v.w! + v.s!,
        solve: {
          f: (v: Values) => v.w! - v.s!,
          w: (v: Values) => v.f! + v.s!,
          s: (v: Values) => v.w! - v.f!,
        },
      },
      {
        id: 'i = f × 2 ÷ 3',
        display: '{f} × 2 ÷ 3 = {i}',
        vars: ['i', 'f'],
        residual: (v: Values) => v.i! - (v.f! * 2) / 3,
        solve: { i: (v: Values) => (v.f! * 2) / 3, f: (v: Values) => (v.i! * 3) / 2 },
      },
      {
        id: 'l = f − i',
        display: '{f} − {i} = {l}',
        vars: ['l', 'f', 'i'],
        residual: (v: Values) => v.l! - v.f! + v.i!,
        solve: {
          l: (v: Values) => v.f! - v.i!,
          f: (v: Values) => v.l! + v.i!,
          i: (v: Values) => v.f! - v.l!,
        },
      },
    ],
    steps: {
      's = w × 97 ÷ 100': {
        s: {
          expr: '{w} × 97 ÷ 100',
          how: 'Find how many hundreds, then take 97 for each hundred.',
          work: (v: Values) => [
            `${fmt(v.w!)} ÷ 100 = ${fmt(v.w! / 100)}`,
            `${fmt(v.w! / 100)} × 97 = ${fmt(v.s!)}`,
          ],
          written: false,
        },
        w: {
          expr: '{s} × 100 ÷ 97',
          how: 'Salt water is 97 for each hundred: find how many hundreds.',
          work: (v: Values) => [
            `${fmt(v.s!)} ÷ 97 = ${fmt(v.s! / 97)} hundreds`,
            `${fmt(v.s! / 97)} × 100 = ${fmt(v.w!)}`,
          ],
          written: false,
        },
      },
      'f = w − s': {
        f: { expr: '{w} − {s}', how: 'The water that is not salty is fresh.' },
        w: { expr: '{f} + {s}', how: 'Salt water and fresh water together are all the water.' },
        s: { expr: '{w} − {f}', how: 'All the water minus the fresh water.' },
      },
      'i = f × 2 ÷ 3': {
        i: { expr: '{f} × 2 ÷ 3', how: 'About 2 of every 3 liters of fresh water are frozen.' },
        f: { expr: '{i} × 3 ÷ 2', how: 'Frozen water is 2 of every 3 liters of fresh: undo that.' },
      },
      'l = f − i': {
        l: { expr: '{f} − {i}', how: 'The fresh water that is not frozen is liquid.' },
        f: { expr: '{l} + {i}', how: 'Liquid and frozen fresh water together.' },
        i: { expr: '{f} − {l}', how: 'Fresh water minus the liquid part.' },
      },
    },
    example: { w: 1000, s: 970, f: 30, i: 20, l: 10 },
    startWith: ['w'],
    unitSystems: ['metric'],
    sliders: false,
    pictureLabels: ['f'],
    representation: { kind: 'pieChart', parts: ['s', 'i', 'l'], total: 'w' },
  },
  // ── The sun as a star: two flashlights (5-ESS1-1) ──
  (() => {
    const far = times(
      'f = n × k',
      ['n', 'k', 'f'],
      ['nearer flashlight', 'times as far', 'farther flashlight'],
    );
    return {
      id: 's.5.sun-star-brightness~two-flashlights',
      title: 'Two flashlights at different distances',
      use: 'Use this to compare two of the same flashlight when one is several times as far away.',
      assumptions: [
        'Two of the same flashlight give the same light.',
        'Twice as far, the lit circle is twice as wide, so the flashlight looks dimmer.',
        'Stars work the same way: the sun is a star that is very close to us.',
      ],
      variables: [
        { ...whole('n', 'n', 'Nearer flashlight', 10, 100), unit: 'cm' },
        whole('k', 'k', 'Times as far', 1, 10),
        { ...whole('f', 'f', 'Farther flashlight', 10, 1000), unit: 'cm' },
      ],
      relations: [far.relation],
      steps: {
        'f = n × k': {
          f: { expr: '{n} × {k}', how: 'That many times the nearer distance.' },
          k: { expr: '{f} ÷ {n}', how: 'Divide the farther distance by the nearer one.' },
          n: { expr: '{f} ÷ {k}', how: 'Divide the farther distance by how many times as far.' },
        },
      },
      example: { n: 50, k: 4, f: 200 },
      startWith: ['n', 'k'],
      unitSystems: ['metric'],
      representation: {
        kind: 'bars',
        bars: [{ var: 'n' }, { var: 'f' }],
        min: 0,
        max: 500,
        scale: 100,
      },
    } satisfies ModuleDef;
  })(),
];
