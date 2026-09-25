/**
 * Science, Kindergarten–Grade 2 (NGSS K-PS2, K-PS3, K-LS1, K-ESS2, K-ESS3, 1-PS4, 1-LS1,
 * 1-LS3, 1-ESS1, 2-PS1, 2-LS2, 2-LS4, 2-ESS1, 2-ESS2). Each lesson keeps one honest counting
 * or measuring model from the investigation students do in class (docs/MODULE_GUIDE.md,
 * "Topics without a natural formula"), in the number range of the grade's math: within 10 in
 * Kindergarten, within 20 in Grade 1, within 100 in Grade 2. No letters, × or ÷ before Grade 3.
 */
import type { Values } from '@/engine/types';

import { difference, div, whole } from './math-k2';
import type { ModuleDef, StepText } from './types';
import {
  addStrategy,
  countList,
  countUp,
  dealLines,
  missingPart,
  repeated,
  subtractStrategy,
  sumSteps,
} from './work';

// ─── Shared pieces ──────────────────────────────────────────────────────────

/** c = a + b with its two take-aways, in K–2 words. `names` say the three values. */
export function sum2(
  id: string,
  [a, b, c]: [string, string, string],
  [an, bn, cn]: [string, string, string],
  display = `{${a}} + {${b}} = {${c}}`,
) {
  const relation = {
    id,
    display,
    vars: [c, a, b],
    residual: (v: Values) => v[c]! - v[a]! - v[b]!,
    solve: {
      [c]: (v: Values) => v[a]! + v[b]!,
      [a]: (v: Values) => v[c]! - v[b]!,
      [b]: (v: Values) => v[c]! - v[a]!,
    },
  };
  const steps: Record<string, StepText> = {
    [c]: {
      expr: `{${a}} + {${b}}`,
      how: `Add the ${an} and the ${bn}.`,
      work: (v) => addStrategy(v[a]!, v[b]!),
    },
    [a]: {
      expr: `{${c}} − {${b}}`,
      how: `Take the ${bn} away from the ${cn}.`,
      work: (v) => subtractStrategy(v[c]!, v[b]!),
    },
    [b]: {
      expr: `{${c}} − {${a}}`,
      how: `Count up from the ${an} to the ${cn}.`,
      work: (v) => countUp(v[a]!, v[c]!),
    },
  };
  return { relation, steps };
}

/** total = every part added, with one take-away per part. */
export function sumAll(id: string, parts: string[], total: string, what: string) {
  const rest = (p: string) => parts.filter((x) => x !== p);
  const relation = {
    id,
    display: `${parts.map((p) => `{${p}}`).join(' + ')} = {${total}}`,
    vars: [total, ...parts],
    residual: (v: Values) => v[total]! - parts.reduce((t, p) => t + v[p]!, 0),
    solve: Object.fromEntries([
      [total, (v: Values) => parts.reduce((t, p) => t + v[p]!, 0)],
      ...parts.map((p) => [p, (v: Values) => v[total]! - rest(p).reduce((t, q) => t + v[q]!, 0)]),
    ]),
  };
  const steps = Object.fromEntries([
    [
      total,
      {
        expr: parts.map((p) => `{${p}}`).join(' + '),
        how: `Add up all the ${what}.`,
        work: (v: Values) => sumSteps(parts.map((p) => v[p]!)),
      },
    ],
    ...parts.map((p) => [
      p,
      {
        expr: `{${total}} − ${rest(p)
          .map((q) => `{${q}}`)
          .join(' − ')}`,
        how: `Take the other ${what} away from the total.`,
        work: (v: Values) =>
          missingPart(
            v[total]!,
            rest(p).map((q) => v[q]!),
          ),
      },
    ]),
  ]) as Record<string, StepText>;
  return { relation, steps };
}

/**
 * Equal groups added up, the way K–2 says it: "3 pushes of 2 spaces = 6 spaces". `noun` is the
 * group (pushes), `thing` what is counted (spaces).
 */
function groupsOf(
  id: string,
  [n, e, t]: [string, string, string],
  noun: [string, string],
  thing: [string, string],
) {
  const relation = {
    id,
    display: `{${n}} ${noun[1]} of {${e}} ${thing[1]} = {${t}} ${thing[1]}`,
    vars: [t, n, e],
    residual: (v: Values) => v[t]! - v[n]! * v[e]!,
    solve: {
      [t]: (v: Values) => v[n]! * v[e]!,
      [n]: (v: Values) => div(v[t]!, v[e]!),
      [e]: (v: Values) => div(v[t]!, v[n]!),
    },
  };
  const steps: Record<string, StepText> = {
    [t]: {
      expr: `{${n}} ${noun[1]} of {${e}} ${thing[1]}`,
      how: `Add the ${thing[1]} once for each ${noun[0]}.`,
      work: (v) => [repeated(v[e]!, v[n]!)],
    },
    [n]: {
      expr: `${noun[1]} of {${e}} ${thing[1]} in {${t}}`,
      how: `Count by ${thing[1]} of one ${noun[0]} up to the total.`,
      work: (v) =>
        v[n]! > 0 ? [`Count by ${v[e]}s: ${countList(0, v[e]!, v[n]!)} → ${v[n]} ${noun[1]}`] : [],
    },
    [e]: {
      expr: `{${t}} ${thing[1]} shared by {${n}} ${noun[1]}`,
      how: `Share the ${thing[1]} equally, one ${noun[0]} at a time.`,
      work: (v) => (v[n]! > 0 ? dealLines(v[n]!, v[e]!, noun[0]) : []),
    },
  };
  return { relation, steps };
}

/** A K–2 comparison: how much more, counting on from the smaller number. */
const moreThan = (
  d: string,
  a: string,
  b: string,
  an: string,
  bn: string,
  words: [string, string],
) =>
  difference(d, a, b, {
    diff: `Count on from the smaller number to the bigger one. That is how much ${words[0]}.`,
    first: [
      `The ${an} is ${words[0]}: add the difference to the ${bn}.`,
      `The ${an} is ${words[1]}: take the difference from the ${bn}.`,
    ],
    second: [
      `The ${bn} is ${words[1]}: take the difference from the ${an}.`,
      `The ${bn} is ${words[0]}: add the difference to the ${an}.`,
    ],
    countOn: true,
    same: `There is no difference. Both are the same.`,
  });

const F = '°F';

// ─── Modules ────────────────────────────────────────────────────────────────

export const SCIENCE_K2_MODULES: ModuleDef[] = [
  // ── Kindergarten: pushes and pulls (K-PS2-1, K-PS2-2) ──
  {
    id: 's.K.pushes-pulls',
    pictureLabels: [],
    assumptions: [
      'A push or a pull makes a box move. Each push moves it 1 space.',
      'Pushes forward and pushes back work against each other.',
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
  (() => {
    const g = groupsOf(
      't = p pushes of e',
      ['p', 'e', 't'],
      ['push', 'pushes'],
      ['space', 'spaces'],
    );
    return {
      id: 's.K.pushes-pulls~strength',
      title: 'A bigger push moves it farther',
      assumptions: [
        'A big push moves the toy more spaces than a small push.',
        'The same push again moves it the same number of spaces.',
      ],
      variables: [
        whole('p', 'p', 'Pushes', 1, 5),
        whole('e', 'e', 'Spaces each push', 1, 2),
        whole('t', 't', 'Spaces in all', 0, 10),
      ],
      relations: [g.relation],
      steps: { 't = p pushes of e': g.steps },
      example: { p: 3, e: 2, t: 6 },
      startWith: ['p', 'e'],
      representation: { kind: 'skipCount', step: 'e', count: 'p', total: 't' },
    } satisfies ModuleDef;
  })(),

  // ── Kindergarten: sunlight warms Earth's surface (K-PS3-1, K-PS3-2) ──
  (() => {
    const warmer = moreThan('w', 'u', 'h', 'sun spot', 'shade spot', ['warmer', 'cooler']);
    return {
      id: 's.K.sunlight-warms',
      assumptions: [
        'Sunlight warms the ground, sand and water it shines on.',
        'A spot in the shade stays cooler.',
        'The thermometer number goes up as it gets warmer.',
      ],
      variables: [
        { ...whole('u', 'u', 'Sun spot', 0, 120), unit: F },
        { ...whole('h', 'h', 'Shade spot', 0, 120), unit: F },
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
    const g = groupsOf('t = d days of e', ['d', 'e', 't'], ['day', 'days'], ['carrot', 'carrots']);
    return {
      id: 's.K.living-needs',
      assumptions: [
        'Animals need food and water every day. Plants need water and light.',
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
  (() => {
    const s = sum2(
      'n = s + u',
      ['s', 'u', 'n'],
      ['seeds that sprouted', 'seeds that did not', 'seeds planted'],
    );
    return {
      id: 's.K.living-needs~sprouting',
      title: 'Seeds with and without water',
      assumptions: [
        'Seeds need water to sprout. Dry seeds stay seeds.',
        'Count the seeds that sprouted and the seeds that did not.',
      ],
      variables: [
        whole('s', 's', 'Sprouted', 0, 10),
        whole('u', 'u', 'Did not sprout', 0, 10),
        whole('n', 'n', 'Seeds planted', 0, 10),
      ],
      relations: [s.relation],
      steps: { 'n = s + u': s.steps },
      example: { s: 7, u: 3, n: 10 },
      startWith: ['s', 'u'],
      representation: { kind: 'tenFrame', first: 's', second: 'u', total: 'n' },
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
        whole('s', 's', 'Sunny days', 0, 10),
        whole('c', 'c', 'Cloudy days', 0, 10),
        whole('r', 'r', 'Rainy days', 0, 10),
        whole('d', 'd', 'Days counted', 0, 10),
      ],
      relations: [all.relation],
      steps: { 'days = sunny + cloudy + rainy': all.steps },
      example: { s: 5, c: 3, r: 2, d: 10 },
      startWith: ['s', 'c', 'r'],
      representation: { kind: 'tally', rows: ['s', 'c', 'r'], total: 'd' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const warmer = moreThan('w', 't', 'y', 'today', 'yesterday', ['warmer', 'cooler']);
    return {
      id: 's.K.weather-patterns~warmer',
      title: 'Warmer or cooler than yesterday',
      assumptions: [
        'Read the thermometer at the same time each day.',
        'A bigger number means a warmer day.',
      ],
      variables: [
        { ...whole('t', 't', 'Today', 0, 120), unit: F },
        { ...whole('y', 'y', 'Yesterday', 0, 120), unit: F },
        { ...whole('w', 'w', 'Warmer by', 0, 120), unit: F },
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

  // ── Kindergarten: living things change their environment (K-ESS2-2, K-ESS3-3) ──
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
        'People change the land. Planting trees adds; cutting trees takes away.',
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

  // ── Grade 1: sound comes from vibrating materials (1-PS4-1) ──
  (() => {
    const more = moreThan('m', 'f', 's', 'tight band', 'loose band', ['more', 'fewer']);
    return {
      id: 's.1.sound-vibration',
      assumptions: [
        'A sound comes from something moving back and forth: vibrating.',
        'Count how many times a rubber band vibrates in one second.',
        'More vibrations each second make a higher sound.',
      ],
      variables: [
        whole('f', 'f', 'Tight band', 0, 20),
        whole('s', 's', 'Loose band', 0, 20),
        whole('m', 'm', 'More each second', 0, 20),
      ],
      relations: [more.relation],
      steps: more.steps,
      example: { f: 12, s: 8, m: 4 },
      startWith: ['f', 's'],
      representation: { kind: 'waves', rows: ['f', 's'], max: 20 },
    } satisfies ModuleDef;
  })(),
  (() => {
    const g = groupsOf(
      't = n seconds of e',
      ['n', 'e', 't'],
      ['second', 'seconds'],
      ['vibration', 'vibrations'],
    );
    return {
      id: 's.1.sound-vibration~seconds',
      title: 'Vibrations in a few seconds',
      assumptions: [
        'The band vibrates the same number of times each second.',
        'Add the vibrations of each second together.',
      ],
      variables: [
        whole('n', 'n', 'Seconds', 1, 2),
        whole('e', 'e', 'Vibrations each second', 1, 10),
        whole('t', 't', 'Vibrations in all', 0, 20),
      ],
      relations: [g.relation],
      steps: { 't = n seconds of e': g.steps },
      example: { n: 2, e: 8, t: 16 },
      startWith: ['n', 'e'],
      representation: { kind: 'skipCount', step: 'e', count: 'n', total: 't' },
    } satisfies ModuleDef;
  })(),

  // ── Grade 1: light and shadows (1-PS4-2, 1-PS4-3) ──
  (() => {
    const shorter = moreThan('d', 'm', 'n', 'morning shadow', 'noon shadow', ['longer', 'shorter']);
    return {
      id: 's.1.light-shadows',
      assumptions: [
        'A shadow forms where an object blocks the light.',
        'When the sun is low, shadows are long. At noon they are short.',
        'Measure each shadow with cubes.',
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
  (() => {
    const all = sumAll(
      'tested = clear + cloudy + blocks',
      ['c', 'd', 'b'],
      't',
      'kinds of material',
    );
    return {
      id: 's.1.light-shadows~materials',
      title: 'What light shines through',
      assumptions: [
        'Shine a flashlight at each material.',
        'Clear things let light through. Cloudy things let some through. Others block it.',
      ],
      variables: [
        whole('c', 'c', 'Let light through', 0, 10),
        whole('d', 'd', 'Let some through', 0, 10),
        whole('b', 'b', 'Blocked the light', 0, 10),
        whole('t', 't', 'Materials tested', 0, 20),
      ],
      relations: [all.relation],
      steps: { 'tested = clear + cloudy + blocks': all.steps },
      example: { c: 3, d: 2, b: 5, t: 10 },
      startWith: ['c', 'd', 'b'],
      representation: { kind: 'tally', rows: ['c', 'd', 'b'], total: 't' },
    } satisfies ModuleDef;
  })(),

  // ── Grade 1: plant and animal parts and what they do (1-LS1-1) ──
  (() => {
    const plant = sum2('t = r + s', ['r', 's', 't'], ['roots', 'stem and leaves', 'whole plant']);
    return {
      id: 's.1.structures-function',
      assumptions: [
        'Roots hold the plant and take in water. The stem holds up the leaves.',
        'Roots grow down under the ground. The stem grows up.',
        'Measure each part with cubes, root tip to leaf tip.',
      ],
      variables: [
        { ...whole('r', 'r', 'Roots', 0, 10), unit: 'cubes' },
        { ...whole('s', 's', 'Stem and leaves', 0, 10), unit: 'cubes' },
        { ...whole('t', 't', 'Whole plant', 0, 20), unit: 'cubes' },
      ],
      relations: [plant.relation],
      steps: { 't = r + s': plant.steps },
      example: { r: 6, s: 9, t: 15 },
      startWith: ['r', 's'],
      representation: { kind: 'tape', parts: ['r', 's'], total: 't' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const longer = moreThan('d', 'a', 'b', 'long beak', 'short beak', ['longer', 'shorter']);
    return {
      id: 's.1.structures-function~beaks',
      title: 'Beaks shaped for their food',
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

  // ── Grade 1: young plants and animals resemble their parents (1-LS3-1) ──
  (() => {
    const litter = sum2(
      'n = a + b',
      ['a', 'b', 'n'],
      ['puppies like the mother', 'puppies that look different', 'puppies'],
    );
    return {
      id: 's.1.offspring',
      assumptions: [
        'Young animals look like their parents, but not exactly the same.',
        'Some puppies have the mother’s spots. Some do not.',
      ],
      variables: [
        whole('a', 'a', 'Spotted like the mother', 0, 10),
        whole('b', 'b', 'Look different', 0, 10),
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
      assumptions: [
        'The sun rises, crosses the sky and sets. That is a pattern.',
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
      },
    } satisfies ModuleDef;
  })(),
  {
    id: 's.1.sky-patterns~moon',
    title: 'Days until the full moon',
    assumptions: [
      'The moon’s shape changes in a pattern that repeats.',
      'From a thin new moon to a full moon takes about 15 days.',
    ],
    variables: [
      whole('p', 'p', 'Days since new moon', 0, 15),
      whole('l', 'l', 'Days to full moon', 0, 15),
    ],
    pictureLabels: ['p', 'l'],
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

  // ── Grade 2: properties of materials (2-PS1-1, 2-PS1-2) ──
  (() => {
    const more = moreThan('m', 'a', 'b', 'paper towel', 'plastic sheet', ['more', 'fewer']);
    return {
      id: 's.2.material-properties',
      assumptions: [
        'Test each material the same way: drop water on it one drop at a time.',
        'Count the drops it soaks up before water runs off.',
        'The material that soaks up more drops is better for wiping up.',
      ],
      variables: [
        whole('a', 'a', 'Paper towel', 0, 50),
        whole('b', 'b', 'Plastic sheet', 0, 50),
        whole('m', 'm', 'More drops', 0, 50),
      ],
      relations: [more.relation],
      steps: more.steps,
      example: { a: 24, b: 6, m: 18 },
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
  (() => {
    const all = sumAll('tested = hard + soft + bendable', ['h', 's', 'b'], 't', 'groups');
    return {
      id: 's.2.material-properties~sort',
      title: 'Sort materials by a property',
      assumptions: [
        'A property is something you can observe: hard, soft, bendable, shiny.',
        'Put each material in one group, then count the groups.',
      ],
      variables: [
        whole('h', 'h', 'Hard', 0, 20),
        whole('s', 's', 'Soft', 0, 20),
        whole('b', 'b', 'Bendable', 0, 20),
        whole('t', 't', 'Materials tested', 0, 30),
      ],
      relations: [all.relation],
      steps: { 'tested = hard + soft + bendable': all.steps },
      example: { h: 7, s: 5, b: 4, t: 16 },
      startWith: ['h', 's', 'b'],
      representation: { kind: 'tally', rows: ['h', 's', 'b'], total: 't' },
    } satisfies ModuleDef;
  })(),

  // ── Grade 2: heating and cooling (2-PS1-4) ──
  (() => {
    const warms = sum2(
      'now = start + rise',
      ['s', 'r', 't'],
      ['start temperature', 'degrees warmer', 'temperature now'],
    );
    return {
      id: 's.2.heating-cooling',
      assumptions: [
        'Heating makes the thermometer number go up. Cooling makes it go down.',
        'Ice melts at 32 °F. Water boils at 212 °F.',
        'Some changes can be undone: melted ice can freeze again.',
      ],
      variables: [
        { ...whole('s', 's', 'Start temperature', 0, 212), unit: F },
        { ...whole('r', 'r', 'Degrees warmer', 0, 100), unit: F },
        { ...whole('t', 't', 'Temperature now', 0, 212), unit: F },
      ],
      relations: [warms.relation],
      steps: { 'now = start + rise': warms.steps },
      example: { s: 40, r: 35, t: 75 },
      startWith: ['s', 'r'],
      representation: {
        kind: 'thermometers',
        items: ['s', 't'],
        difference: 'r',
        min: 0,
        max: 100,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const cools = sum2(
      'later = now − drop',
      ['l', 'c', 'n'],
      ['temperature later', 'degrees cooler', 'temperature now'],
      '{n} − {c} = {l}',
    );
    return {
      id: 's.2.heating-cooling~cooling',
      title: 'Cooling down',
      assumptions: [
        'In the freezer, water cools until it freezes at 32 °F.',
        'Take the degrees it cools away from the temperature now.',
      ],
      variables: [
        { ...whole('n', 'n', 'Temperature now', 0, 212), unit: F },
        { ...whole('c', 'c', 'Degrees cooler', 0, 100), unit: F },
        { ...whole('l', 'l', 'Temperature later', 0, 212), unit: F },
      ],
      relations: [cools.relation],
      steps: { 'later = now − drop': cools.steps },
      example: { n: 68, c: 36, l: 32 },
      startWith: ['n', 'c'],
      representation: {
        kind: 'thermometers',
        items: ['n', 'l'],
        difference: 'c',
        min: 0,
        max: 100,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const changes = sum2(
      't = r + i',
      ['r', 'i', 't'],
      ['changes that can be undone', 'changes that cannot', 'changes tested'],
    );
    return {
      id: 's.2.heating-cooling~undo',
      title: 'Changes you can and cannot undo',
      assumptions: [
        'Melting ice and freezing water can be undone.',
        'Cooking an egg or burning paper cannot be undone.',
        'Sort each change, then count the two groups.',
      ],
      variables: [
        whole('r', 'r', 'Can be undone', 0, 10),
        whole('i', 'i', 'Cannot be undone', 0, 10),
        whole('t', 't', 'Changes tested', 0, 20),
      ],
      relations: [changes.relation],
      steps: { 't = r + i': changes.steps },
      example: { r: 4, i: 6, t: 10 },
      startWith: ['r', 'i'],
      representation: { kind: 'tally', rows: ['r', 'i'], total: 't' },
    } satisfies ModuleDef;
  })(),

  // ── Grade 2: what plants need to grow (2-LS2-1) ──
  (() => {
    const taller = moreThan('d', 's', 'h', 'plant in the sun', 'plant in the shade', [
      'taller',
      'shorter',
    ]);
    return {
      id: 's.2.plant-growth-investigation',
      assumptions: [
        'Grow two plants the same way, except one gets sunlight and one does not.',
        'Water both the same. Measure them after two weeks.',
        'The difference shows what sunlight does.',
      ],
      variables: [
        { ...whole('s', 's', 'Plant in the sun', 0, 50), unit: 'cm' },
        { ...whole('h', 'h', 'Plant in the shade', 0, 50), unit: 'cm' },
        { ...whole('d', 'd', 'Taller by', 0, 50), unit: 'cm' },
      ],
      relations: [taller.relation],
      steps: taller.steps,
      example: { s: 24, h: 9, d: 15 },
      startWith: ['s', 'h'],
      representation: { kind: 'ruler', lengths: ['s', 'h'], difference: 'd', extent: 30 },
    } satisfies ModuleDef;
  })(),
  (() => {
    const grew = sum2(
      'now = start + growth',
      ['s', 'g', 'n'],
      ['height at the start', 'growth', 'height now'],
    );
    return {
      id: 's.2.plant-growth-investigation~week',
      title: 'How much a plant grew',
      assumptions: [
        'Measure the plant at the start of the week and at the end.',
        'The growth is how much taller it got.',
      ],
      variables: [
        { ...whole('s', 's', 'Height at the start', 0, 50), unit: 'cm' },
        { ...whole('g', 'g', 'Growth', 0, 50), unit: 'cm' },
        { ...whole('n', 'n', 'Height now', 0, 100), unit: 'cm' },
      ],
      relations: [grew.relation],
      steps: { 'now = start + growth': grew.steps },
      example: { s: 18, g: 7, n: 25 },
      startWith: ['s', 'n'],
      representation: {
        kind: 'hops',
        start: 's',
        hops: [{ var: 'g', sign: 1 }],
        end: 'n',
        min: 0,
        max: 50,
        tick: 5,
      },
    } satisfies ModuleDef;
  })(),

  // ── Grade 2: pollination and seed dispersal (2-LS2-2) ──
  (() => {
    const visits = sum2(
      'f = a + b',
      ['a', 'b', 'f'],
      ['morning visits', 'afternoon visits', 'flowers visited'],
    );
    return {
      id: 's.2.pollination-dispersal',
      assumptions: [
        'A bee carries pollen from flower to flower. That is pollination.',
        'Each visit can pollinate one flower.',
        'Count the visits in the morning and in the afternoon.',
      ],
      variables: [
        whole('a', 'a', 'Morning visits', 0, 100),
        whole('b', 'b', 'Afternoon visits', 0, 100),
        whole('f', 'f', 'Flowers visited', 0, 100),
      ],
      relations: [visits.relation],
      steps: { 'f = a + b': visits.steps },
      example: { a: 36, b: 27, f: 63 },
      startWith: ['a', 'b'],
      representation: { kind: 'tape', parts: ['a', 'b'], total: 'f' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const all = sumAll('seeds = fur + wind + fell', ['a', 'b', 'c'], 's', 'ways the seeds went');
    return {
      id: 's.2.pollination-dispersal~seeds',
      title: 'Where the seeds went',
      assumptions: [
        'Seeds travel: some stick to fur, some blow away, some just fall.',
        'Seeds that travel can grow in new places.',
      ],
      variables: [
        whole('a', 'a', 'Stuck to fur', 0, 50),
        whole('b', 'b', 'Blown by the wind', 0, 50),
        whole('c', 'c', 'Fell under the plant', 0, 50),
        whole('s', 's', 'Seeds', 0, 100),
      ],
      relations: [all.relation],
      steps: { 'seeds = fur + wind + fell': all.steps },
      example: { a: 8, b: 15, c: 22, s: 45 },
      startWith: ['a', 'b', 'c'],
      representation: { kind: 'tape', parts: ['a', 'b', 'c'], total: 's' },
    } satisfies ModuleDef;
  })(),

  // ── Grade 2: biodiversity in habitats (2-LS4-1) ──
  (() => {
    const more = moreThan('m', 'p', 'd', 'pond', 'desert', ['more', 'fewer']);
    return {
      id: 's.2.habitats',
      assumptions: [
        'A habitat is where living things get what they need.',
        'Different habitats have different kinds of plants and animals.',
        'Count the kinds you find in each habitat.',
      ],
      variables: [
        whole('p', 'p', 'Kinds in the pond', 0, 50),
        whole('d', 'd', 'Kinds in the desert', 0, 50),
        whole('m', 'm', 'More kinds', 0, 50),
      ],
      relations: [more.relation],
      steps: more.steps,
      example: { p: 18, d: 7, m: 11 },
      startWith: ['p', 'd'],
      representation: {
        kind: 'bars',
        bars: [
          { var: 'p', editable: true },
          { var: 'd', editable: true },
        ],
        min: 0,
        max: 20,
        scale: 5,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const all = sumAll(
      'animals = frogs + fish + insects',
      ['f', 'h', 'i'],
      'n',
      'kinds of animals',
    );
    return {
      id: 's.2.habitats~pond-count',
      title: 'Animals seen at the pond',
      assumptions: [
        'Sit still and count each animal you see.',
        'Put each animal in its group, then add the groups.',
      ],
      variables: [
        whole('f', 'f', 'Frogs', 0, 10),
        whole('h', 'h', 'Fish', 0, 10),
        whole('i', 'i', 'Insects', 0, 10),
        whole('n', 'n', 'Animals', 0, 30),
      ],
      relations: [all.relation],
      steps: { 'animals = frogs + fish + insects': all.steps },
      example: { f: 3, h: 6, i: 9, n: 18 },
      startWith: ['f', 'h', 'i'],
      representation: {
        kind: 'pictureGraph',
        columns: [
          { var: 'f', icon: 'circle' },
          { var: 'h', icon: 'triangle' },
          { var: 'i', icon: 'star' },
        ],
        max: 10,
        total: 'n',
      },
    } satisfies ModuleDef;
  })(),

  // ── Grade 2: landforms and Earth changes (2-ESS1-1, 2-ESS2-1, 2-ESS2-2) ──
  (() => {
    const g = groupsOf(
      't = y years of e',
      ['y', 'e', 't'],
      ['year', 'years'],
      ['centimeter', 'centimeters'],
    );
    return {
      id: 's.2.erosion-landforms',
      assumptions: [
        'Some changes are fast: an earthquake. Some are slow: a river wearing away its bank.',
        'The river takes about the same amount of bank each year.',
        'Count by that amount, once for each year.',
      ],
      variables: [
        whole('y', 'y', 'Years', 0, 10),
        whole('e', 'e', 'Centimeters worn away each year', 1, 10),
        whole('t', 't', 'Centimeters worn away in all', 0, 100),
      ],
      relations: [g.relation],
      steps: { 't = y years of e': g.steps },
      example: { y: 4, e: 5, t: 20 },
      startWith: ['y', 'e'],
      representation: { kind: 'skipCount', step: 'e', count: 'y', total: 't' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const saved = moreThan('d', 'a', 'b', 'bank with no wall', 'bank with a wall', [
      'more',
      'less',
    ]);
    return {
      id: 's.2.erosion-landforms~wall',
      title: 'Slowing erosion with a wall',
      assumptions: [
        'People build walls and plant grass to slow down erosion.',
        'Measure how much soil each bank lost in the same rain.',
        'The difference is the soil the wall saved.',
      ],
      variables: [
        { ...whole('a', 'a', 'Lost with no wall', 0, 100), unit: 'cm' },
        { ...whole('b', 'b', 'Lost with a wall', 0, 100), unit: 'cm' },
        { ...whole('d', 'd', 'Soil saved', 0, 100), unit: 'cm' },
      ],
      relations: [saved.relation],
      steps: saved.steps,
      example: { a: 30, b: 8, d: 22 },
      startWith: ['a', 'b'],
      representation: {
        kind: 'bars',
        bars: [
          { var: 'a', editable: true },
          { var: 'b', editable: true },
        ],
        min: 0,
        max: 40,
        scale: 10,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    const all = sumAll(
      'landforms = mountains + lakes + rivers',
      ['m', 'l', 'r'],
      'n',
      'kinds of landforms',
    );
    return {
      id: 's.2.erosion-landforms~map',
      title: 'Landforms on a map',
      assumptions: [
        'A map shows the shape of the land: mountains, lakes and rivers.',
        'Count each kind on the map, then add them.',
      ],
      variables: [
        whole('m', 'm', 'Mountains', 0, 20),
        whole('l', 'l', 'Lakes', 0, 20),
        whole('r', 'r', 'Rivers', 0, 20),
        whole('n', 'n', 'Landforms', 0, 60),
      ],
      relations: [all.relation],
      steps: { 'landforms = mountains + lakes + rivers': all.steps },
      example: { m: 5, l: 3, r: 4, n: 12 },
      startWith: ['m', 'l', 'r'],
      representation: { kind: 'tally', rows: ['m', 'l', 'r'], total: 'n' },
    } satisfies ModuleDef;
  })(),

  // ── Grade 2: where water is found on Earth (2-ESS2-3) ──
  (() => {
    const water = sum2('w = s + f', ['s', 'f', 'w'], ['salty cups', 'fresh cups', 'cups of water']);
    return {
      id: 's.2.water-on-earth',
      assumptions: [
        'Most of Earth’s water is salty ocean water. Only a little is fresh.',
        'Picture Earth’s water as 100 cups: about 97 are salty and 3 are fresh.',
        'Fresh water is in ice, rivers, lakes and under the ground.',
      ],
      variables: [
        { ...whole('s', 's', 'Salty', 0, 100), unit: 'cups' },
        { ...whole('f', 'f', 'Fresh', 0, 100), unit: 'cups' },
        { ...whole('w', 'w', 'All the water', 0, 100), unit: 'cups' },
      ],
      relations: [water.relation],
      steps: { 'w = s + f': water.steps },
      example: { s: 97, f: 3, w: 100 },
      startWith: ['s', 'f'],
      representation: { kind: 'tape', parts: ['s', 'f'], total: 'w' },
    } satisfies ModuleDef;
  })(),
  (() => {
    const all = sumAll('fresh = ice + rivers + ground', ['i', 'r', 'g'], 'f', 'places');
    return {
      id: 's.2.water-on-earth~fresh',
      title: 'Where the fresh water is',
      assumptions: [
        'Most fresh water is frozen in ice. Much of the rest is under the ground.',
        'Rivers and lakes hold only a little.',
        'Picture the fresh water as 100 cups.',
      ],
      variables: [
        { ...whole('i', 'i', 'In ice', 0, 100), unit: 'cups' },
        { ...whole('r', 'r', 'In rivers and lakes', 0, 100), unit: 'cups' },
        { ...whole('g', 'g', 'Under the ground', 0, 100), unit: 'cups' },
        { ...whole('f', 'f', 'Fresh water', 0, 100), unit: 'cups' },
      ],
      relations: [all.relation],
      steps: { 'fresh = ice + rivers + ground': all.steps },
      example: { i: 69, r: 1, g: 30, f: 100 },
      startWith: ['i', 'r', 'g'],
      representation: { kind: 'tape', parts: ['i', 'r', 'g'], total: 'f' },
    } satisfies ModuleDef;
  })(),
];
