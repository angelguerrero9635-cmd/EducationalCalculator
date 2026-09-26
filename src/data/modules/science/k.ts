/**
 * Kindergarten science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 */
import { FAHRENHEIT, groupsOf, moreThan, sum2, sumAll, whole } from '../helpers';
import type { ModuleDef } from '../types';
import { addStrategy, countUp, subtractStrategy } from '../work';

const F = FAHRENHEIT;

export const SCIENCE_K_MODULES: ModuleDef[] = [
  // ── Kindergarten: pushes and pulls (K-PS2-1, K-PS2-2) ──
  (() => {
    const farther = moreThan('d', 'a', 'b', 'big push', 'small push', ['farther', 'shorter']);
    return {
      id: 's.K.pushes-pulls',
      assumptions: [
        'A push or a pull makes a toy car move.',
        'A big push moves it farther than a small push.',
        'Measure how far the car rolled with cubes.',
      ],
      variables: [
        { ...whole('a', 'a', 'Big push', 0, 20), unit: 'cubes' },
        { ...whole('b', 'b', 'Small push', 0, 20), unit: 'cubes' },
        { ...whole('d', 'd', 'Farther by', 0, 20), unit: 'cubes' },
      ],
      relations: [farther.relation],
      steps: farther.steps,
      example: { a: 9, b: 4, d: 5 },
      startWith: ['a', 'b'],
      representation: { kind: 'ruler', lengths: ['a', 'b'], difference: 'd', extent: 20 },
    } satisfies ModuleDef;
  })(),
  {
    id: 's.K.pushes-pulls~forward',
    title: 'Pushes forward and pushes back',
    use: 'Use this for “5 pushes forward, 2 back. How many spaces forward?”',
    assumptions: [
      'Each push moves the box 1 space. A push back undoes a push forward.',
      'Here there are more pushes forward, so the box ends up forward.',
    ],
    variables: [
      whole('f', 'f', 'Pushes forward', 0, 10),
      whole('b', 'b', 'Pushes back', 0, 10),
      whole('s', 's', 'Spaces forward', 0, 10),
    ],
    relations: [
      {
        id: 'f − b = s',
        display: '{f} − {b} = {s}',
        vars: ['s', 'f', 'b'],
        residual: (v) => v.s! - (v.f! - v.b!),
        solve: { s: (v) => v.f! - v.b!, f: (v) => v.s! + v.b!, b: (v) => v.f! - v.s! },
      },
    ],
    steps: {
      'f − b = s': {
        s: {
          expr: '{f} − {b}',
          how: 'Each push back undoes one push forward. Take them away.',
          work: (v) => subtractStrategy(v.f!, v.b!),
        },
        f: {
          expr: '{s} + {b}',
          how: 'The pushes forward made the spaces and undid the pushes back.',
          work: (v) => addStrategy(v.s!, v.b!),
        },
        b: {
          expr: '{f} − {s}',
          how: 'Count up from the spaces forward to the pushes forward.',
          work: (v) => countUp(v.s!, v.f!),
        },
      },
    },
    example: { f: 5, b: 2, s: 3 },
    startWith: ['f', 'b'],
    representation: {
      kind: 'hops',
      start: 'f',
      hops: [{ var: 'b', sign: -1 }],
      end: 's',
      min: 0,
      max: 10,
    },
  },
  {
    id: 's.K.pushes-pulls~back',
    title: 'More pushes back: the box moves back',
    use: 'Use this for “2 pushes forward, 6 back. How many spaces back?”',
    assumptions: [
      'Each push moves the box 1 space. A push forward undoes a push back.',
      'Here there are more pushes back, so the box ends up back.',
    ],
    variables: [
      whole('b', 'b', 'Pushes back', 0, 10),
      whole('f', 'f', 'Pushes forward', 0, 10),
      whole('s', 's', 'Spaces back', 0, 10),
    ],
    relations: [
      {
        id: 'b − f = s',
        display: '{b} − {f} = {s}',
        vars: ['s', 'b', 'f'],
        residual: (v) => v.s! - (v.b! - v.f!),
        solve: { s: (v) => v.b! - v.f!, b: (v) => v.s! + v.f!, f: (v) => v.b! - v.s! },
      },
    ],
    steps: {
      'b − f = s': {
        s: {
          expr: '{b} − {f}',
          how: 'Each push forward undoes one push back. Take them away.',
          work: (v) => subtractStrategy(v.b!, v.f!),
        },
        b: {
          expr: '{s} + {f}',
          how: 'The pushes back made the spaces and undid the pushes forward.',
          work: (v) => addStrategy(v.s!, v.f!),
        },
        f: {
          expr: '{b} − {s}',
          how: 'Count up from the spaces back to the pushes back.',
          work: (v) => countUp(v.s!, v.b!),
        },
      },
    },
    example: { b: 6, f: 2, s: 4 },
    startWith: ['b', 'f'],
    representation: {
      kind: 'hops',
      start: 'b',
      hops: [{ var: 'f', sign: -1 }],
      end: 's',
      min: 0,
      max: 10,
    },
  },
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
        { ...whole('u', 'u', 'Sunny spot', 0, 120), unit: F },
        { ...whole('h', 'h', 'Shady spot', 0, 120), unit: F },
        { ...whole('w', 'w', 'Warmer by', 0, 120), unit: F },
      ],
      relations: [warmer.relation],
      steps: warmer.steps,
      example: { u: 78, h: 72, w: 6 },
      startWith: ['u', 'h'],
      representation: {
        kind: 'thermometers',
        items: ['u', 'h'],
        difference: 'w',
        min: 50,
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
        { ...whole('s', 's', 'Start temperature', 0, 120), unit: F },
        { ...whole('r', 'r', 'Degrees warmer', 0, 10), unit: F },
        { ...whole('t', 't', 'Temperature now', 0, 120), unit: F },
      ],
      relations: [warms.relation],
      steps: { 'now = start + rise': warms.steps },
      example: { s: 70, r: 6, t: 76 },
      startWith: ['s', 'r'],
      representation: {
        kind: 'thermometers',
        items: ['s', 't'],
        difference: 'r',
        min: 50,
        max: 100,
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
  (() => {
    const g = groupsOf(
      't = d days of e',
      ['d', 'e', 't'],
      ['day', 'days'],
      ['carrot', 'carrots'],
      true,
    );
    return {
      id: 's.K.living-needs~food',
      title: 'Food for a few days',
      use: 'Use this for “A rabbit eats 2 carrots a day. How many in 3 days?”',
      assumptions: [
        'Animals need food every day.',
        'A rabbit eats the same number of carrots each day.',
      ],
      variables: [
        whole('d', 'd', 'Days', 1, 5),
        whole('e', 'e', 'Carrots each day', 1, 2),
        whole('t', 't', 'Carrots in all', 0, 10),
      ],
      relations: [g.relation],
      steps: { 't = d days of e': g.steps },
      example: { d: 3, e: 2, t: 6 },
      startWith: ['d', 'e'],
      representation: { kind: 'skipCount', step: 'e', count: 'd', total: 't' },
    } satisfies ModuleDef;
  })(),
  // ── Kindergarten: local weather patterns (K-ESS2-1) ──
  (() => {
    const all = sumAll('days = sunny + cloudy + rainy', ['s', 'c', 'r'], 'd', 'kinds of days');
    return {
      id: 's.K.weather-patterns',
      assumptions: [
        'Each day, mark the weather: sunny, cloudy or rainy.',
        'Count the marks to see which weather came most.',
      ],
      variables: [
        whole('s', 's', 'Sunny days', 0, 31),
        whole('c', 'c', 'Cloudy days', 0, 31),
        whole('r', 'r', 'Rainy days', 0, 31),
        whole('d', 'd', 'Days counted', 0, 31),
      ],
      relations: [all.relation],
      steps: { 'days = sunny + cloudy + rainy': all.steps },
      example: { s: 12, c: 6, r: 4, d: 22 },
      startWith: ['s', 'c', 'r'],
      representation: { kind: 'tally', rows: ['s', 'c', 'r'], total: 'd' },
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
        { ...whole('t', 't', 'Today', 0, 120), unit: F },
        { ...whole('y', 'y', 'Yesterday', 0, 120), unit: F },
        { ...whole('w', 'w', 'Degrees apart', 0, 120), unit: F },
      ],
      relations: [warmer.relation],
      steps: warmer.steps,
      example: { t: 64, y: 58, w: 6 },
      startWith: ['t', 'y'],
      representation: {
        kind: 'thermometers',
        items: ['t', 'y'],
        difference: 'w',
        min: 30,
        max: 100,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const planted = sum2(
      'm = b + p',
      ['b', 'p', 'm'],
      ['trees before', 'trees planted', 'trees after planting'],
    );
    const cut = sum2(
      'm − c = n',
      ['n', 'c', 'm'],
      ['trees now', 'trees cut down', 'trees after planting'],
      '{m} − {c} = {n}',
    );
    return {
      id: 's.K.living-things-change-environment',
      pictureLabels: ['m'],
      assumptions: [
        'Living things change the land. A beaver cuts trees. People plant trees.',
        'Count the trees before, then add and take away.',
      ],
      variables: [
        whole('b', 'b', 'Trees before', 0, 10),
        whole('p', 'p', 'Trees planted', 0, 10),
        whole('m', 'm', 'Trees after planting', 0, 10),
        whole('c', 'c', 'Trees cut down', 0, 10),
        whole('n', 'n', 'Trees now', 0, 10),
      ],
      relations: [planted.relation, cut.relation],
      steps: { 'm = b + p': planted.steps, 'm − c = n': cut.steps },
      example: { b: 4, p: 5, m: 9, c: 2, n: 7 },
      startWith: ['b', 'p', 'c'],
      representation: {
        kind: 'hops',
        start: 'b',
        hops: [
          { var: 'p', sign: 1 },
          { var: 'c', sign: -1 },
        ],
        end: 'n',
        min: 0,
        max: 10,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const all = sumAll('pieces = cans + bottles + paper', ['a', 'b', 'c'], 'p', 'kinds of litter');
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
        whole('b', 'b', 'Bottles', 0, 10),
        whole('c', 'c', 'Paper', 0, 10),
        whole('p', 'p', 'Pieces picked up', 0, 10),
      ],
      relations: [all.relation],
      steps: { 'pieces = cans + bottles + paper': all.steps },
      example: { a: 4, b: 2, c: 3, p: 9 },
      startWith: ['a', 'b', 'c'],
      representation: { kind: 'tally', rows: ['a', 'b', 'c'], total: 'p' },
    } satisfies ModuleDef;
  })(),
];
