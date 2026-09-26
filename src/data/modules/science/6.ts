/**
 * Grade 6 science: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md.
 * The sort, sequence, explore and observe pages of the grade are in `../layouts/science.ts`.
 *
 * Grade 6 science names its values in words, with no letters standing for numbers: a science
 * class can meet density before its math class meets variables.
 */
import { formatNumber } from '@/engine/format';
import type { Values } from '@/engine/types';

import { div, minus, whole } from '../helpers';
import type { ModuleDef } from '../types';

const fmt = (x: number) => formatNumber(x);
const exact = (x: number) => Number(x.toFixed(9));

/** Published densities in g/cm³ (a handbook table), for "about the density of aluminum". */
const MATERIALS: [string, number][] = [
  ['cork', 0.24],
  ['pine wood', 0.5],
  ['ice', 0.92],
  ['water', 1],
  ['glass', 2.5],
  ['aluminum', 2.7],
  ['iron', 7.87],
  ['copper', 8.96],
  ['silver', 10.5],
  ['lead', 11.3],
  ['gold', 19.3],
];
/** The material whose density is within 3% of this one, if any. */
export const nearestMaterial = (d: number) =>
  MATERIALS.find(([, x]) => Math.abs(d - x) <= 0.03 * x)?.[0];
const materialNote = (d: number) => {
  const m = nearestMaterial(d);
  const sinks = d > 1 ? 'sinks in water' : d < 1 ? 'floats on water' : 'the same as water';
  return m && m !== 'water' ? `(about the density of ${m}: it ${sinks})` : `(it ${sinks})`;
};

export const SCIENCE_6_MODULES: ModuleDef[] = [
  // ── Cells (MS-LS1-1) ──
  {
    id: 's.6.cells~magnification',
    title: 'Total magnification',
    use: 'Use this to find a microscope’s total magnification from its two lenses.',
    assumptions: [
      'The eyepiece is the lens you look through. On most school microscopes it is 10×.',
      'The objective is the lens near the slide: 4×, 10× or 40×; some microscopes also have 100×.',
      '400× means the image looks 400 times as wide as the real thing.',
    ],
    variables: [
      { ...whole('e', 'e', 'Eyepiece power', 10, 15), unit: '×', allowed: [10, 15] },
      { ...whole('o', 'o', 'Objective power', 4, 100), unit: '×', allowed: [4, 10, 40, 100] },
      { ...whole('t', 't', 'Total magnification', 40, 1500), unit: '×' },
    ],
    relations: [
      {
        id: 't = e × o',
        display: '{e} × {o} = {t}',
        words: 'Eyepiece power × objective power = total magnification',
        vars: ['t', 'e', 'o'],
        residual: (v: Values) => v.t! - v.e! * v.o!,
        solve: {
          t: (v: Values) => v.e! * v.o!,
          o: (v: Values) => div(v.t!, v.e!),
          e: (v: Values) => div(v.t!, v.o!),
        },
      },
    ],
    steps: {
      't = e × o': {
        t: {
          expr: '{e} × {o}',
          how: 'Each lens enlarges the image the other one makes, so multiply the two powers.',
        },
        o: { expr: '{t} ÷ {e}', how: 'Divide the total by the eyepiece power.' },
        e: { expr: '{t} ÷ {o}', how: 'Divide the total by the objective power.' },
      },
    },
    example: { e: 10, o: 40, t: 400 },
    startWith: ['e', 'o'],
    representation: {
      kind: 'table',
      sweep: 'o',
      output: 't',
      params: ['e'],
      rows: [4, 10, 40, 100],
    },
  },
  {
    id: 's.6.cells~cell-size',
    title: 'Cell size from the field of view',
    use: 'Use this to estimate a cell’s length from how many fit across the field of view.',
    unitSystems: ['metric'],
    assumptions: [
      'A micrometer (µm) is a thousandth of a millimeter. Most cells are 10 to 100 µm long.',
      'With a 10× eyepiece the circle is about 4,500 µm across at 40×, 1,800 µm at 100× and 450 µm at 400×.',
      'Count the cells end to end across the middle of the circle.',
    ],
    variables: [
      { id: 'f', symbol: 'f', name: 'Field of view', unit: 'µm', min: 100, max: 5000, step: 10 },
      whole('n', 'n', 'Cells across', 1, 100),
      { id: 's', symbol: 's', name: 'Cell length', unit: 'µm', min: 1, max: 5000 },
    ],
    relations: [
      {
        id: 'f = n × s',
        display: '{f} ÷ {n} = {s}',
        words: 'Field of view ÷ cells across = cell length',
        check: (v: Values) => `${v.n} × ${fmt(v.s!)} = ${fmt(v.f!)}`,
        vars: ['f', 'n', 's'],
        residual: (v: Values) => v.f! - v.n! * v.s!,
        solve: {
          s: (v: Values) => div(v.f!, v.n!),
          f: (v: Values) => exact(v.n! * v.s!),
          n: (v: Values) => div(v.f!, v.s!),
        },
      },
    ],
    steps: {
      'f = n × s': {
        s: {
          expr: '{f} ÷ {n}',
          how: 'The cells end to end fill the circle, so share its width among them.',
        },
        f: {
          expr: '{n} × {s}',
          how: 'The cells end to end fill the circle, so multiply one length by the count.',
        },
        n: { expr: '{f} ÷ {s}', how: 'Divide the width of the circle by one cell’s length.' },
      },
    },
    example: { f: 1800, n: 6, s: 300 },
    startWith: ['f', 'n'],
    representation: { kind: 'fieldOfView', field: 'f', across: 'n', size: 's' },
  },
  {
    id: 's.6.cells~why-small',
    title: 'Why cells stay small',
    use: 'Use this to see how a cube’s surface compares with its volume as it grows.',
    unitSystems: ['metric'],
    assumptions: [
      'Food and oxygen enter a cell through its surface, and the whole inside uses them.',
      'As a cube grows, its volume grows faster than its surface, so each cm³ gets less surface.',
      'So living things grow by making more cells, not bigger ones.',
    ],
    variables: [
      whole('a', 'a', 'Side in cm', 1, 10),
      { id: 'S', symbol: 'S', name: 'Surface area in cm²', min: 6, max: 600, derived: true },
      { id: 'V', symbol: 'V', name: 'Volume in cm³', min: 1, max: 1000, derived: true },
      { id: 'r', symbol: 'r', name: 'Surface for each cm³', min: 0.6, max: 6, derived: true },
    ],
    relations: [
      {
        id: 'S = 6 × a × a',
        display: '6 × {a} × {a} = {S}',
        words: '6 faces × side × side = surface area',
        vars: ['S', 'a'],
        residual: (v: Values) => v.S! - 6 * v.a! * v.a!,
        solve: { S: (v: Values) => 6 * v.a! * v.a!, a: () => undefined },
      },
      {
        id: 'V = a × a × a',
        display: '{a} × {a} × {a} = {V}',
        words: 'Side × side × side = volume',
        vars: ['V', 'a'],
        residual: (v: Values) => v.V! - v.a! ** 3,
        solve: { V: (v: Values) => v.a! ** 3, a: () => undefined },
      },
      {
        id: 'r = S ÷ V',
        display: '{S} ÷ {V} = {r}',
        words: 'Surface area ÷ volume = surface for each cm³',
        check: (v: Values) => `${fmt(v.r!)} × ${fmt(v.V!)} = ${fmt(v.S!)}`,
        vars: ['r', 'S', 'V'],
        residual: (v: Values) => v.r! * v.V! - v.S!,
        solve: { r: (v: Values) => div(v.S!, v.V!), S: () => undefined, V: () => undefined },
      },
    ],
    steps: {
      'S = 6 × a × a': {
        S: { expr: '6 × {a} × {a}', how: 'A cube has 6 square faces, each side × side.' },
      },
      'V = a × a × a': {
        V: {
          expr: '{a} × {a} × {a}',
          how: 'Side × side for one layer, times the side for the layers.',
        },
      },
      'r = S ÷ V': {
        r: {
          expr: '{S} ÷ {V}',
          how: 'Share the surface among the cubic centimeters inside.',
          note: (v) => `(each cm³ gets ${fmt(v.r!)} cm² of surface)`,
        },
      },
    },
    example: { a: 2, S: 24, V: 8, r: 3 },
    startWith: ['a'],
    representation: {
      kind: 'table',
      sweep: 'a',
      output: 'r',
      params: [],
      rows: [1, 2, 3, 4, 5, 6],
    },
  },

  // ── Body systems (MS-LS1-3) ──
  {
    id: 's.6.body-systems~heart-output',
    title: 'Blood pumped each minute',
    use: 'Use this to find how much blood the heart pumps in a minute.',
    unitSystems: ['metric'],
    assumptions: [
      'Heart rate is how many times the heart beats in one minute. Feel it as your pulse.',
      'An adult’s heart pushes out about 70 mL each beat; a sixth grader’s, a little less.',
      'At rest an adult’s heart pumps about 5 liters a minute, about all the blood in the body.',
      'Exercise raises the heart rate, so the muscles get more oxygen.',
    ],
    variables: [
      { ...whole('h', 'h', 'Heart rate', 40, 220), unit: 'beats per minute' },
      whole('b', 'b', 'Blood per beat in mL', 20, 200),
      { id: 'q', symbol: 'q', name: 'Blood each minute in mL', min: 800, max: 44000 },
    ],
    relations: [
      {
        id: 'q = h × b',
        display: '{h} × {b} = {q}',
        words: 'Heart rate × blood per beat = blood each minute',
        vars: ['q', 'h', 'b'],
        residual: (v: Values) => v.q! - v.h! * v.b!,
        solve: {
          q: (v: Values) => v.h! * v.b!,
          h: (v: Values) => div(v.q!, v.b!),
          b: (v: Values) => div(v.q!, v.h!),
        },
      },
    ],
    steps: {
      'q = h × b': {
        q: {
          expr: '{h} × {b}',
          how: 'Each beat pushes out the same amount, so multiply by the beats in a minute.',
          note: (v) => `(${fmt(v.q! / 1000)} liters)`,
        },
        h: { expr: '{q} ÷ {b}', how: 'Divide the blood each minute by the blood in one beat.' },
        b: { expr: '{q} ÷ {h}', how: 'Share the blood each minute among the beats.' },
      },
    },
    example: { h: 80, b: 60, q: 4800 },
    startWith: ['h', 'b'],
    representation: {
      kind: 'table',
      sweep: 'h',
      output: 'q',
      params: ['b'],
      rows: [60, 80, 100, 120, 140, 160, 180],
    },
  },

  // ── Density (MS-PS1-2) ──
  {
    id: 's.6.density',
    unitSystems: ['metric'],
    assumptions: [
      'Density is how much mass is packed into each cubic centimeter.',
      'Every piece of one pure material has the same density, big or small, so density helps identify it.',
      'Water’s density is 1 g/cm³. A solid denser than water sinks in it; a less dense one floats.',
      'g/cm³ means grams in each cubic centimeter. 1 mL is 1 cm³, so g/mL is the same.',
    ],
    variables: [
      { id: 'm', symbol: 'm', name: 'Mass', unit: 'g', min: 0, max: 10000 },
      { id: 'V', symbol: 'V', name: 'Volume', unit: 'cm³', min: 0.1, max: 10000, step: 0.1 },
      { id: 'rho', symbol: 'ρ', name: 'Density', unit: 'g/cm³', min: 0.01, max: 25, step: 0.01 },
    ],
    relations: [
      {
        id: 'ρ = m ÷ V',
        display: '{m} ÷ {V} = {rho}',
        words: 'Mass ÷ volume = density',
        check: (v: Values) => `${fmt(v.rho!)} × ${fmt(v.V!)} = ${fmt(v.m!)}`,
        vars: ['rho', 'm', 'V'],
        residual: (v: Values) => v.rho! * v.V! - v.m!,
        solve: {
          rho: (v: Values) => div(v.m!, v.V!),
          m: (v: Values) => v.rho! * v.V!,
          V: (v: Values) => div(v.m!, v.rho!),
        },
      },
    ],
    steps: {
      'ρ = m ÷ V': {
        rho: {
          expr: '{m} ÷ {V}',
          how: 'Density is the mass in each cubic centimeter, so share the mass over the volume.',
          note: (v) => materialNote(v.rho!),
        },
        m: {
          expr: '{rho} × {V}',
          how: 'Each cubic centimeter holds the density’s mass, so multiply by the cubic centimeters.',
        },
        V: {
          expr: '{m} ÷ {rho}',
          how: 'Each cubic centimeter holds the density’s mass: how many of those fit in the mass?',
        },
      },
    },
    example: { m: 54, V: 20, rho: 2.7 },
    startWith: ['m', 'V'],
    representation: {
      kind: 'plot',
      x: { var: 'V', min: 0, max: 40 },
      y: { var: 'm', min: 0, max: 100 },
      params: ['rho'],
      autoRange: true,
      reference: [{ slope: 1, label: 'Water' }],
    },
  },
  (() => {
    const rise = minus(
      'V = c − a',
      ['V', 'c', 'a'],
      [
        'The object pushes aside its own volume of water, so the rise is its volume.',
        'The level rises by the object’s volume.',
        'Take the object’s volume from the level after.',
      ],
    );
    return {
      id: 's.6.density~displacement',
      title: 'Volume by water displacement',
      use: 'Use this to find an object’s volume and density with a graduated cylinder.',
      unitSystems: ['metric'],
      assumptions: [
        'The water rises by exactly the object’s volume when it sinks all the way under.',
        '1 mL of space is 1 cm³, so the rise in mL is the volume in cm³.',
        'Read the level at the bottom of the curved surface, with your eye level with it.',
        'For an object that floats, push it under with a thin wire.',
      ],
      variables: [
        {
          id: 'a',
          symbol: 'a',
          name: 'Water level before',
          unit: 'mL',
          min: 0,
          max: 1000,
          step: 1,
        },
        { id: 'c', symbol: 'c', name: 'Water level after', unit: 'mL', min: 0, max: 1000, step: 1 },
        { id: 'V', symbol: 'V', name: 'Object volume', unit: 'mL', min: 0.1, max: 1000 },
        { id: 'm', symbol: 'm', name: 'Mass', unit: 'g', min: 0.1, max: 10000 },
        { id: 'rho', symbol: 'ρ', name: 'Density', unit: 'g/mL', min: 0.01, max: 25 },
      ],
      relations: [
        {
          ...rise.relation,
          words: 'Water level after − water level before = object volume',
          solve: {
            V: (v: Values) => exact(v.c! - v.a!),
            c: (v: Values) => exact(v.V! + v.a!),
            a: (v: Values) => exact(v.c! - v.V!),
          },
        },
        {
          id: 'ρ = m ÷ V',
          display: '{m} ÷ {V} = {rho}',
          words: 'Mass ÷ object volume = density',
          check: (v: Values) => `${fmt(v.rho!)} × ${fmt(v.V!)} = ${fmt(v.m!)}`,
          vars: ['rho', 'm', 'V'],
          residual: (v: Values) => v.rho! * v.V! - v.m!,
          solve: {
            rho: (v: Values) => div(v.m!, v.V!),
            m: (v: Values) => v.rho! * v.V!,
            V: (v: Values) => div(v.m!, v.rho!),
          },
        },
      ],
      steps: {
        'V = c − a': rise.steps,
        'ρ = m ÷ V': {
          rho: {
            expr: '{m} ÷ {V}',
            how: 'Share the mass over the milliliters (cubic centimeters) of the object.',
            note: (v: Values) => materialNote(v.rho!),
          },
          m: { expr: '{rho} × {V}', how: 'Each milliliter holds the density’s mass: multiply.' },
          V: { expr: '{m} ÷ {rho}', how: 'How many of the density’s mass fit in the mass?' },
        },
      },
      example: { a: 50, c: 62, V: 12, m: 32.4, rho: 2.7 },
      startWith: ['a', 'c', 'm'],
      pictureLabels: ['m', 'rho'],
      representation: { kind: 'gradCylinder', before: 'a', after: 'c', volume: 'V', max: 100 },
    } satisfies ModuleDef;
  })(),

  // ── The water cycle (MS-ESS2-4) ──
  {
    id: 's.6.water-cycle~roof-rain',
    title: 'Rain collected from a roof',
    use: 'Use this to find how much rain falls on a roof in one storm.',
    unitSystems: ['metric'],
    assumptions: [
      'A rain gauge measures rain as a depth in millimeters.',
      '1 mm of rain on 1 square meter is exactly 1 liter of water.',
      'Some water splashes or evaporates, so a barrel collects a little less.',
    ],
    variables: [
      { id: 'l', symbol: 'l', name: 'Roof length', unit: 'm', min: 1, max: 200, step: 0.5 },
      { id: 'w', symbol: 'w', name: 'Roof width', unit: 'm', min: 1, max: 200, step: 0.5 },
      { id: 'A', symbol: 'A', name: 'Roof area', unit: 'm²', min: 1, max: 40000 },
      { id: 'r', symbol: 'r', name: 'Rainfall in millimeters', min: 0, max: 500, step: 1 },
      { id: 'W', symbol: 'W', name: 'Water collected', unit: 'liters', min: 0, max: 20000000 },
    ],
    relations: [
      {
        id: 'A = l × w',
        display: '{l} × {w} = {A}',
        words: 'Roof length × roof width = roof area',
        vars: ['A', 'l', 'w'],
        residual: (v: Values) => v.A! - v.l! * v.w!,
        solve: {
          A: (v: Values) => v.l! * v.w!,
          l: (v: Values) => div(v.A!, v.w!),
          w: (v: Values) => div(v.A!, v.l!),
        },
      },
      {
        id: 'W = A × r',
        display: '{A} × {r} = {W}',
        words: 'Roof area × rainfall = water collected',
        vars: ['W', 'A', 'r'],
        residual: (v: Values) => v.W! - v.A! * v.r!,
        solve: {
          W: (v: Values) => v.A! * v.r!,
          r: (v: Values) => div(v.W!, v.A!),
          A: (v: Values) => div(v.W!, v.r!),
        },
      },
    ],
    steps: {
      'A = l × w': {
        A: { expr: '{l} × {w}', how: 'Length times width gives the square meters of roof.' },
        l: { expr: '{A} ÷ {w}', how: 'Divide the roof area by the width.' },
        w: { expr: '{A} ÷ {l}', how: 'Divide the roof area by the length.' },
      },
      'W = A × r': {
        W: {
          expr: '{A} × {r}',
          how: 'Each millimeter of rain on each square meter is 1 liter, so multiply.',
        },
        r: { expr: '{W} ÷ {A}', how: 'Divide the liters by the square meters.' },
        A: { expr: '{W} ÷ {r}', how: 'Divide the liters by the millimeters.' },
      },
    },
    example: { l: 20, w: 10, A: 200, r: 25, W: 5000 },
    startWith: ['l', 'w', 'r'],
    pictureLabels: ['r', 'W'],
    representation: { kind: 'rectangle', length: 'l', width: 'w', inside: 'A', extent: 20 },
  },
  (() => {
    const gap = minus(
      'd = t − p',
      ['d', 't', 'p'],
      [
        'Take the dew point from the air temperature.',
        'The air is warmer than its dew point by the difference.',
        'The dew point is below the air temperature by the difference.',
      ],
    );
    return {
      id: 's.6.water-cycle~cloud-base',
      title: 'How high clouds form',
      use: 'Use this to estimate the height of the cloud base from the temperature and dew point.',
      unitSystems: ['metric'],
      assumptions: [
        'The dew point is the temperature at which water vapor starts to condense into droplets.',
        'Rising air cools, and clouds form where it has cooled to its dew point.',
        'Each 1 °C between the air temperature and the dew point puts the cloud base about 125 m higher.',
        'The air temperature is at least the dew point.',
      ],
      variables: [
        {
          id: 't',
          symbol: 't',
          name: 'Air temperature',
          unit: '°C',
          min: -40,
          max: 50,
          step: 0.5,
          multipleOf: 0.5,
        },
        {
          id: 'p',
          symbol: 'p',
          name: 'Dew point',
          unit: '°C',
          min: -40,
          max: 50,
          step: 0.5,
          multipleOf: 0.5,
        },
        {
          id: 'd',
          symbol: 'd',
          name: 'Difference',
          unit: '°C',
          min: 0,
          max: 50,
          step: 0.5,
          multipleOf: 0.5,
        },
        { id: 'h', symbol: 'h', name: 'Cloud base', unit: 'm', min: 0, max: 6250 },
      ],
      relations: [
        {
          ...gap.relation,
          display: 'From {p} up to {t}: {d}',
          words: 'From the dew point up to the air temperature = difference',
        },
        {
          id: 'h = d × 125',
          display: '{d} × 125 = {h}',
          words: 'Difference × 125 = cloud base',
          vars: ['h', 'd'],
          residual: (v: Values) => v.h! - v.d! * 125,
          solve: { h: (v: Values) => v.d! * 125, d: (v: Values) => v.h! / 125 },
        },
      ],
      steps: {
        'd = t − p': {
          ...gap.steps,
          d: {
            ...gap.steps.d!,
            // Below 0 the difference is counted up through 0, not subtracted (−3 is Grade 7).
            expr: (v: Values) => (v.p! >= 0 ? '{t} − {p}' : 'From {p} up to {t}'),
            work: (v: Values) =>
              v.p! >= 0
                ? []
                : v.t! <= 0
                  ? [
                      `|${fmt(v.p!)}| − |${fmt(v.t!)}| = ${fmt(-v.p!)} − ${fmt(-v.t!)} = ${fmt(v.d!)}`,
                    ]
                  : [
                      `From ${fmt(v.p!)} up to 0 is ${fmt(-v.p!)}`,
                      `From 0 up to ${fmt(v.t!)} is ${fmt(v.t!)}`,
                      `${fmt(-v.p!)} + ${fmt(v.t!)} = ${fmt(v.d!)}`,
                    ],
            written: false,
          },
        },
        'h = d × 125': {
          h: {
            expr: '{d} × 125',
            how: 'Each degree of difference puts the cloud base 125 m higher.',
          },
          d: { expr: '{h} ÷ 125', how: 'Each 125 m of height is 1 °C of difference.' },
        },
      },
      example: { t: 25, p: 17, d: 8, h: 1000 },
      startWith: ['t', 'p'],
      pictureLabels: ['h'],
      representation: {
        kind: 'thermometers',
        items: ['t', 'p'],
        difference: 'd',
        min: -10,
        max: 40,
      },
    } satisfies ModuleDef;
  })(),

  // ── Weather fronts (MS-ESS2-5) ──
  {
    id: 's.6.weather-fronts~arrival',
    title: 'When will the front arrive?',
    use: 'Use this to estimate when a front will reach you.',
    assumptions: [
      'Cold fronts often move about 25 to 50 km each hour; warm fronts about half as fast.',
      'A front can speed up, slow down or stall, so the answer is an estimate.',
      'Distances to 3,000 km.',
    ],
    variables: [
      { id: 'd', symbol: 'd', name: 'Distance to the front in km', min: 0, max: 3000 },
      { id: 's', symbol: 's', name: 'Front speed in km each hour', min: 5, max: 80, step: 1 },
      { id: 't', symbol: 't', name: 'Time to arrive in hours', min: 0, max: 600 },
    ],
    relations: [
      {
        id: 'd = s × t',
        display: '{d} ÷ {s} = {t}',
        words: 'Distance ÷ speed = time to arrive',
        check: (v: Values) => `${fmt(v.s!)} × ${fmt(v.t!)} = ${fmt(v.d!)}`,
        vars: ['d', 's', 't'],
        residual: (v: Values) => v.d! - v.s! * v.t!,
        solve: {
          t: (v: Values) => div(v.d!, v.s!),
          d: (v: Values) => v.s! * v.t!,
          s: (v: Values) => div(v.d!, v.t!),
        },
      },
    ],
    steps: {
      'd = s × t': {
        t: {
          expr: '{d} ÷ {s}',
          how: 'Each hour the front covers its speed: how many hours fit in the distance?',
        },
        d: { expr: '{s} × {t}', how: 'Each hour covers the speed: multiply by the hours.' },
        s: { expr: '{d} ÷ {t}', how: 'Share the distance over the hours.' },
      },
    },
    example: { d: 300, s: 30, t: 10 },
    startWith: ['d', 's'],
    representation: { kind: 'doubleNumberLine', top: 't', bottom: 'd', per: 's', ticks: 10 },
  },

  // ── Plate tectonics (MS-ESS2-3) ──
  {
    id: 's.6.plate-tectonics~speed',
    title: 'How fast a plate moves',
    use: 'Use this to find a plate’s speed in centimeters a year from distance and time.',
    assumptions: [
      'A hot spot under Hawaii makes volcanoes, and the Pacific Plate carries each island away from it.',
      'Plates move a few centimeters a year, about as fast as fingernails grow.',
      'The speed is an average: plates creep, and faults can slip suddenly in earthquakes.',
    ],
    variables: [
      { id: 'd', symbol: 'd', name: 'Distance moved in km', min: 0, max: 10000 },
      { id: 't', symbol: 't', name: 'Time in millions of years', min: 0.1, max: 300, step: 0.1 },
      {
        id: 'k',
        symbol: 'k',
        name: 'Kilometers each million years',
        min: 0,
        max: 2000,
        derived: true,
      },
      { id: 'c', symbol: 'c', name: 'Centimeters each year', min: 0.1, max: 20, step: 0.1 },
    ],
    relations: [
      {
        id: 'd = k × t',
        display: '{d} ÷ {t} = {k}',
        words: 'Distance ÷ time = kilometers each million years',
        check: (v: Values) => `${fmt(v.k!)} × ${fmt(v.t!)} = ${fmt(v.d!)}`,
        vars: ['d', 'k', 't'],
        residual: (v: Values) => v.d! - v.k! * v.t!,
        solve: {
          k: (v: Values) => div(v.d!, v.t!),
          d: (v: Values) => exact(v.k! * v.t!),
          t: (v: Values) => div(v.d!, v.k!),
        },
      },
      {
        id: 'c = k ÷ 10',
        display: '{k} ÷ 10 = {c}',
        words: 'Kilometers each million years ÷ 10 = centimeters each year',
        check: (v: Values) => `${fmt(v.c!)} × 10 = ${fmt(v.k!)}`,
        vars: ['c', 'k'],
        residual: (v: Values) => v.c! * 10 - v.k!,
        solve: { c: (v: Values) => v.k! / 10, k: (v: Values) => exact(v.c! * 10) },
      },
    ],
    steps: {
      'd = k × t': {
        k: { expr: '{d} ÷ {t}', how: 'Share the distance over the millions of years.' },
        d: { expr: '{k} × {t}', how: 'Each million years adds the same distance: multiply.' },
        t: { expr: '{d} ÷ {k}', how: 'How many millions of years fit in the distance?' },
      },
      'c = k ÷ 10': {
        c: {
          expr: '{k} ÷ 10',
          how: 'A kilometer is 100,000 cm and a million years is 1,000,000 years, so divide by 10.',
        },
        k: { expr: '{c} × 10', how: 'Each centimeter a year is 10 km each million years.' },
      },
    },
    example: { d: 500, t: 5, k: 100, c: 10 },
    startWith: ['d', 't'],
    pictureLabels: ['c'],
    representation: { kind: 'doubleNumberLine', top: 't', bottom: 'd', per: 'k', ticks: 5 },
  },

  // ── The rock cycle (MS-ESS2-1) ──
  {
    id: 's.6.rock-cycle~layer-time',
    title: 'How long a layer took to form',
    use: 'Use this to estimate how long a sediment layer took to build up.',
    assumptions: [
      'The rate is how thick a layer grows in 1,000 years.',
      'The deep sea floor gains about 1 cm of shell ooze in 1,000 years; one river flood can leave several centimeters.',
      'Layers squeeze thinner as they harden into rock, so the answer is an estimate.',
    ],
    variables: [
      { id: 'd', symbol: 'd', name: 'Layer thickness in cm', min: 0.1, max: 100000 },
      { id: 'r', symbol: 'r', name: 'Centimeters each 1,000 years', min: 0.01, max: 100 },
      { id: 't', symbol: 't', name: 'Time in thousands of years', min: 0, max: 10000000 },
    ],
    relations: [
      {
        id: 'd = r × t',
        display: '{d} ÷ {r} = {t}',
        words: 'Layer thickness ÷ centimeters each 1,000 years = time in thousands of years',
        check: (v: Values) => `${fmt(v.r!)} × ${fmt(v.t!)} = ${fmt(v.d!)}`,
        vars: ['d', 'r', 't'],
        residual: (v: Values) => v.d! - v.r! * v.t!,
        solve: {
          t: (v: Values) => div(v.d!, v.r!),
          d: (v: Values) => exact(v.r! * v.t!),
          r: (v: Values) => div(v.d!, v.t!),
        },
      },
    ],
    steps: {
      'd = r × t': {
        t: {
          expr: '{d} ÷ {r}',
          how: 'Each 1,000 years adds one rate’s worth, so divide the thickness by the rate.',
        },
        d: { expr: '{r} × {t}', how: 'Multiply the rate by the thousands of years.' },
        r: { expr: '{d} ÷ {t}', how: 'Divide the thickness by the thousands of years.' },
      },
    },
    example: { d: 30, r: 1, t: 30 },
    startWith: ['d', 'r'],
    representation: { kind: 'doubleNumberLine', top: 't', bottom: 'd', per: 'r', ticks: 10 },
  },
];
