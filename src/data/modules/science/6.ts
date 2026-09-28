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
  const sinks =
    d > 1 ? 'sinks in water' : d < 1 ? 'floats on water' : 'has the same density as water';
  return m && m !== 'water' ? `(about the density of ${m}: it ${sinks})` : `(it ${sinks})`;
};

export const SCIENCE_6_MODULES: ModuleDef[] = [
  // ── Cells (MS-LS1-1) ──
  {
    id: 's.6.cells~magnification',
    title: 'Total magnification',
    use: 'Use this for “A 10× eyepiece and a 40× lens: what is the total magnification?”',
    assumptions: [
      'The eyepiece is the lens you look through. On most school microscopes it is 10×.',
      'The objective is the lens near the slide: 4×, 10× or 40×; some microscopes also have 100×.',
      '400× means the image looks 400 times as wide as the real thing.',
      'At higher power fewer cells fit in the circle, but each looks bigger. Eyepieces are 5×, 10×, 15× or 20×.',
    ],
    variables: [
      { ...whole('e', 'e', 'Eyepiece power', 5, 20), unit: '×', allowed: [5, 10, 15, 20] },
      { ...whole('o', 'o', 'Objective power', 4, 100), unit: '×', allowed: [4, 10, 40, 100] },
      { ...whole('t', 't', 'Total magnification', 20, 2000), unit: '×' },
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
    use: 'Use this for “About 20 cells fit across a 2 mm field. How long is one cell?”',
    unitSystems: ['metric'],
    assumptions: [
      'A micrometer (µm) is a thousandth of a millimeter. Most cells are 10 to 100 µm long; onion skin cells are bigger, about 200 to 400 µm.',
      'With a 10× eyepiece the circle is about 4,500 µm across at 40×, 1,800 µm at 100× and 450 µm at 400×.',
      'Count the cells end to end across the middle of the circle.',
    ],
    variables: [
      {
        id: 'f',
        symbol: 'f',
        name: 'Width of the field of view',
        unit: 'µm',
        min: 100,
        max: 5000,
        step: 10,
      },
      whole('n', 'n', 'Cells across', 1, 100),
      { id: 's', symbol: 's', name: 'Cell length', unit: 'µm', min: 1, max: 5000 },
    ],
    relations: [
      {
        id: 'f = n × s',
        display: '{f} ÷ {n} = {s}',
        words: 'Width of the field of view ÷ cells across = cell length',
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
      { ...whole('a', 'a', 'Side', 1, 10), unit: 'cm', units: ['cm'] },
      {
        id: 'S',
        symbol: 'S',
        name: 'Surface area',
        unit: 'cm²',
        units: ['cm²'],
        min: 6,
        max: 600,
        derived: true,
      },
      {
        id: 'V',
        symbol: 'V',
        name: 'Volume',
        unit: 'cm³',
        units: ['cm³'],
        min: 1,
        max: 1000,
        derived: true,
      },
      {
        id: 'r',
        symbol: 'r',
        name: 'Surface in cm² for each cm³',
        min: 0.6,
        max: 6,
        derived: true,
      },
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
        words: 'Surface area ÷ volume = surface in cm² for each cm³',
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
          how: 'Side × side cubes fill one layer, and there are as many layers as the side.',
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
    pictureLabels: ['S', 'V'],
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
    use: 'Use this for “70 beats a minute, 70 mL a beat. How much blood a minute?”',
    unitSystems: ['metric'],
    assumptions: [
      'Heart rate is how many times the heart beats in one minute. Feel it as your pulse.',
      'An adult’s heart pushes out about 70 mL each beat; a sixth grader’s, a little less.',
      'At rest an adult’s heart pumps about 5 liters a minute, about all the blood in the body.',
      'Exercise raises the heart rate, so the muscles get more oxygen.',
    ],
    variables: [
      { ...whole('h', 'h', 'Heart rate', 40, 220), unit: 'beats per minute' },
      { ...whole('b', 'b', 'Blood per beat', 40, 150), unit: 'mL', units: ['mL'] },
      {
        id: 'q',
        symbol: 'q',
        name: 'Blood each minute',
        unit: 'mL',
        units: ['mL'],
        min: 1600,
        max: 33000,
      },
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
      { id: 'm', symbol: 'm', name: 'Mass', unit: 'g', min: 0.1, max: 10000 },
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
        'The object pushes aside its own volume of water, so the rise in mL is its volume in cm³ (1 mL = 1 cm³).',
        'The level rises by the object’s volume.',
        'Take the object’s volume from the level after.',
      ],
    );
    return {
      id: 's.6.density~displacement',
      title: 'Volume by water displacement',
      use: 'Use this for “The water rose from 50 mL to 62 mL. What is the object’s volume and density?”',
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
          min: 5,
          max: 1000,
          step: 1,
        },
        { id: 'c', symbol: 'c', name: 'Water level after', unit: 'mL', min: 0, max: 1000, step: 1 },
        { id: 'V', symbol: 'V', name: 'Object volume', unit: 'cm³', min: 0.1, max: 1000 },
        { id: 'm', symbol: 'm', name: 'Mass', unit: 'g', min: 0.1, max: 10000 },
        { id: 'rho', symbol: 'ρ', name: 'Density', unit: 'g/cm³', min: 0.01, max: 25 },
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
            how: 'Share the mass over the cubic centimeters of the object.',
            note: (v: Values) => materialNote(v.rho!),
          },
          m: {
            expr: '{rho} × {V}',
            how: 'Each cubic centimeter holds the density’s mass: multiply.',
          },
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
    use: 'Use this for “How many liters of rain fall on a 10 m by 8 m roof in a 25 mm storm?”',
    unitSystems: ['metric'],
    assumptions: [
      'A rain gauge measures rain as a depth in millimeters.',
      '1 mm of rain on 1 square meter is exactly 1 liter of water.',
      'Some water splashes or evaporates, so a barrel collects a little less.',
    ],
    variables: [
      { id: 'l', symbol: 'l', name: 'Roof length', unit: 'm', min: 1, max: 100, step: 0.5 },
      { id: 'w', symbol: 'w', name: 'Roof width', unit: 'm', min: 1, max: 100, step: 0.5 },
      { id: 'A', symbol: 'A', name: 'Roof area', unit: 'm²', min: 1, max: 10000 },
      { id: 'r', symbol: 'r', name: 'Rainfall', unit: 'mm', min: 0, max: 300, step: 1 },
      { id: 'W', symbol: 'W', name: 'Water collected', unit: 'liters', min: 0, max: 3000000 },
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
    representation: {
      kind: 'rectangle',
      length: 'l',
      width: 'w',
      inside: 'A',
      extent: 20,
      roof: true,
    },
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
      use: 'Use this for “How high will the clouds form?” from the temperature and the dew point.',
      unitSystems: ['metric'],
      assumptions: [
        'The dew point is the temperature at which water vapor starts to condense into droplets.',
        'Rising air cools, and clouds form where it has cooled to its dew point.',
        'Each 1 °C between the air temperature and the dew point puts the cloud base about 125 m higher above the ground.',
        'The air temperature is at least the dew point. A cloud base at 0 m is fog.',
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
          max: 35,
          step: 0.5,
          multipleOf: 0.5,
        },
        {
          id: 'd',
          symbol: 'd',
          name: 'Temperature difference',
          unit: '°C',
          min: 0,
          max: 50,
          step: 0.5,
          multipleOf: 0.5,
        },
        { id: 'h', symbol: 'h', name: 'Height of the cloud base', unit: 'm', min: 0, max: 6250 },
      ],
      relations: [
        {
          ...gap.relation,
          display: 'From {p} up to {t}: {d}',
          words: 'How far the air temperature is above the dew point = temperature difference',
        },
        {
          id: 'h = d × 125',
          display: '{d} × 125 = {h}',
          words: 'Temperature difference × 125 = height of the cloud base',
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
    use: 'Use this for “A front 300 km away moves 30 km each hour. When will it arrive?”',
    assumptions: [
      'Cold fronts often move about 25 to 50 km each hour; warm fronts about half as fast.',
      'A front can speed up, slow down or stall, so the answer is an estimate.',
      'Weather maps and radar show how far away a front is.',
    ],
    variables: [
      {
        id: 'd',
        symbol: 'd',
        name: 'Distance to the front',
        unit: 'km',
        units: ['km'],
        min: 0,
        max: 3000,
      },
      {
        id: 's',
        symbol: 's',
        name: 'Front speed',
        unit: 'km/h',
        units: ['km/h'],
        min: 5,
        max: 80,
        step: 1,
      },
      { id: 't', symbol: 't', name: 'Time to arrive', unit: 'h', units: ['h'], min: 0, max: 600 },
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
          how: 'Each hour the front moves its speed in km, so count how many of those fit in the distance.',
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
    use: 'Use this for “Kauai moved about 500 km in 5 million years. How fast is that?”',
    assumptions: [
      'A hot spot under Hawaii makes volcanoes, and the Pacific Plate carries each island away from it.',
      'Kauai is about 500 km from the hot spot, and its oldest rock is about 5 million years old.',
      'Plates move a few centimeters a year, about as fast as fingernails grow.',
      'The speed is an average: plates creep, and faults can slip suddenly in earthquakes.',
    ],
    variables: [
      {
        id: 'd',
        symbol: 'd',
        name: 'Distance moved',
        unit: 'km',
        units: ['km'],
        min: 0,
        max: 10000,
      },
      { id: 't', symbol: 't', name: 'Time in millions of years', min: 0.1, max: 300, step: 0.1 },
      {
        id: 'k',
        symbol: 'k',
        name: 'Speed in km each million years',
        min: 0,
        max: 2000,
        derived: true,
      },
      { id: 'c', symbol: 'c', name: 'Speed in cm each year', min: 0.1, max: 20, step: 0.1 },
    ],
    relations: [
      {
        id: 'd = k × t',
        display: '{d} ÷ {t} = {k}',
        words: 'Distance ÷ time = speed in km each million years',
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
        words: 'Speed in km each million years ÷ 10 = speed in cm each year',
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
          how: '1 km in a million years is 100,000 cm in 1,000,000 years: 0.1 cm a year. So divide by 10.',
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
    use: 'Use this for “About 1 cm of ooze builds up in 1,000 years. How long for 30 cm?”',
    assumptions: [
      'The rate is how thick a layer grows in 1,000 years.',
      'The deep sea floor gains about 1 cm of shell ooze in 1,000 years; one river flood can leave several centimeters.',
      'Layers squeeze thinner as they harden into rock, so the answer is an estimate.',
    ],
    variables: [
      {
        id: 'd',
        symbol: 'd',
        name: 'Layer thickness',
        unit: 'cm',
        units: ['cm'],
        min: 0.1,
        max: 10000,
      },
      { id: 'r', symbol: 'r', name: 'Rate in cm each 1,000 years', min: 0.1, max: 100 },
      { id: 't', symbol: 't', name: 'Time in thousands of years', min: 0, max: 100000 },
    ],
    relations: [
      {
        id: 'd = r × t',
        display: '{d} ÷ {r} = {t}',
        words: 'Layer thickness ÷ rate = time in thousands of years',
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
          note: (v) => `(${fmt(v.t! * 1000)} years)`,
        },
        d: { expr: '{r} × {t}', how: 'Multiply the rate by the thousands of years.' },
        r: { expr: '{d} ÷ {t}', how: 'Divide the thickness by the thousands of years.' },
      },
    },
    example: { d: 30, r: 1, t: 30 },
    startWith: ['d', 'r'],
    representation: { kind: 'doubleNumberLine', top: 't', bottom: 'd', per: 'r', ticks: 10 },
  },

  // ── Thermal energy (MS-PS3-3, MS-PS3-4): a drink warming in a cup ──
  {
    id: 's.6.thermal-energy',
    unitSystems: ['metric'],
    assumptions: [
      'Thermal energy flows from warmer to cooler until both are the same temperature.',
      'A cold drink in a warm room warms up. How fast depends on the cup: a thin metal cup lets energy through faster than a foam cup.',
      'Warming rate is the degrees gained each minute. It is steady while the drink is much colder than the room.',
      'The drink cannot get warmer than the room.',
    ],
    variables: [
      {
        id: 's',
        symbol: 's',
        name: 'Start temperature',
        unit: '°C',
        min: -10,
        max: 100,
        step: 0.1,
      },
      {
        id: 'r',
        symbol: 'r',
        name: 'Warming rate',
        unit: '°C/min',
        min: 0.01,
        max: 10,
        step: 0.01,
      },
      { id: 't', symbol: 't', name: 'Minutes', unit: 'min', min: 0.1, max: 600, step: 0.1 },
      {
        id: 'c',
        symbol: 'c',
        name: 'Temperature change',
        unit: '°C',
        min: 0,
        max: 120,
        step: 0.1,
        derived: true,
      },
      {
        id: 'f',
        symbol: 'f',
        name: 'Temperature after',
        unit: '°C',
        min: -10,
        max: 100,
        step: 0.1,
      },
    ],
    relations: [
      {
        id: 'c = r × t',
        display: '{r} × {t} = {c}',
        words: 'Warming rate × minutes = temperature change',
        vars: ['c', 'r', 't'],
        residual: (v: Values) => v.c! - v.r! * v.t!,
        solve: {
          c: (v: Values) => v.r! * v.t!,
          r: (v: Values) => div(v.c!, v.t!),
          t: (v: Values) => div(v.c!, v.r!),
        },
      },
      {
        id: 'f = s + c',
        display: '{s} + {c} = {f}',
        words: 'Start temperature + temperature change = temperature after',
        vars: ['f', 's', 'c'],
        residual: (v: Values) => v.f! - v.s! - v.c!,
        solve: {
          f: (v: Values) => v.s! + v.c!,
          s: (v: Values) => v.f! - v.c!,
          c: (v: Values) => v.f! - v.s!,
        },
      },
    ],
    steps: {
      'c = r × t': {
        c: {
          expr: '{r} × {t}',
          how: 'Each minute the drink gains the rate’s degrees, so multiply by the minutes.',
        },
        r: {
          expr: '{c} ÷ {t}',
          how: 'Share the change over the minutes: degrees gained each minute.',
        },
        t: { expr: '{c} ÷ {r}', how: 'How many minutes of that rate make the change?' },
      },
      'f = s + c': {
        f: { expr: '{s} + {c}', how: 'Add the gain to where it started.' },
        s: { expr: '{f} − {c}', how: 'Take the gain away from the temperature after.' },
        c: { expr: '{f} − {s}', how: 'The change is after minus before.' },
      },
    },
    example: { s: 4, r: 0.5, t: 20, c: 10, f: 14 },
    startWith: ['s', 'r', 't'],
    representation: {
      kind: 'plot',
      x: { var: 't', min: 0, max: 60 },
      y: { var: 'f', min: 0, max: 30 },
      params: ['s', 'r'],
      autoRange: true,
    },
  },
  // ── Mixing hot and cold water: equal amounts settle at the middle temperature ──
  {
    id: 's.6.thermal-energy~mix',
    title: 'Mix hot and cold water',
    use: 'Use this for “Equal cups of 80 °C and 20 °C water are mixed. What is the temperature?”',
    unitSystems: ['metric'],
    assumptions: [
      'Thermal energy moves from the hot water to the cold water until they are the same temperature.',
      'With equal amounts, the hot water cools as much as the cold water warms: the mix ends halfway between.',
      'Halfway is the average: add the two temperatures and divide by 2.',
    ],
    variables: [
      { id: 'h', symbol: 'h', name: 'Hot water', unit: '°C', min: 0, max: 100, step: 0.1 },
      { id: 'c', symbol: 'c', name: 'Cold water', unit: '°C', min: 0, max: 100, step: 0.1 },
      { id: 'm', symbol: 'm', name: 'Mixed water', unit: '°C', min: 0, max: 100, step: 0.1 },
    ],
    relations: [
      {
        id: 'h ≥ c',
        constraint: true,
        display: 'The hot water {h} is at least as warm as the cold water {c}',
        vars: ['h', 'c'],
        residual: (v: Values) => (v.h! >= v.c! ? 0 : 1),
        solve: {},
      },
      {
        id: 'm = (h + c) ÷ 2',
        display: '({h} + {c}) ÷ 2 = {m}',
        words: '(Hot + cold) ÷ 2 = mixed temperature',
        check: (v: Values) => `${fmt(v.m!)} − ${fmt(v.c!)} = ${fmt(v.h!)} − ${fmt(v.m!)}`,
        vars: ['m', 'h', 'c'],
        residual: (v: Values) => 2 * v.m! - v.h! - v.c!,
        solve: {
          m: (v: Values) => (v.h! + v.c!) / 2,
          h: (v: Values) => 2 * v.m! - v.c!,
          c: (v: Values) => 2 * v.m! - v.h!,
        },
      },
    ],
    steps: {
      'h ≥ c': {},
      'm = (h + c) ÷ 2': {
        m: {
          expr: '({h} + {c}) ÷ 2',
          how: 'The hot cup gives what the cold cup gains, so the mix is the average of the two.',
          note: (v) =>
            `(the hot water cooled ${fmt(v.h! - v.m!)} °C; the cold water warmed ${fmt(v.m! - v.c!)} °C)`,
        },
        h: {
          expr: '2 × {m} − {c}',
          how: 'The mix is halfway, so the hot water was as far above it as the cold was below.',
        },
        c: {
          expr: '2 × {m} − {h}',
          how: 'The cold water was as far below the mix as the hot water was above.',
        },
      },
    },
    example: { h: 80, c: 20, m: 50 },
    startWith: ['h', 'c'],
    representation: {
      kind: 'tape',
      compare: ['h', 'c'],
      difference: 'm',
      caption: 'The mix settles at {m} °C, halfway between.',
    },
  },
  // ── Light and matter (MS-PS4-2): light hitting a surface is reflected, absorbed or transmitted ──
  {
    id: 's.6.light-matter',
    unitSystems: ['metric'],
    assumptions: [
      'When light hits a material, each bit of it is reflected (bounces off), absorbed (taken in) or transmitted (passes through).',
      'The three parts add up to all the light that arrived: 100 percent.',
      'A mirror reflects most of it; black cloth absorbs most; clear glass transmits most; a window at night does some of each.',
      'Absorbed light warms the material.',
    ],
    variables: [
      { id: 'r', symbol: 'r', name: 'Reflected', unit: '%', min: 0, max: 100, step: 0.1 },
      { id: 'a', symbol: 'a', name: 'Absorbed', unit: '%', min: 0, max: 100, step: 0.1 },
      { id: 't', symbol: 't', name: 'Transmitted', unit: '%', min: 0, max: 100, step: 0.1 },
    ],
    relations: [
      {
        id: 'r + a + t = 100',
        display: '{r} + {a} + {t} = 100',
        words: 'Reflected + absorbed + transmitted = all the light',
        vars: ['r', 'a', 't'],
        residual: (v: Values) => v.r! + v.a! + v.t! - 100,
        solve: {
          r: (v: Values) => 100 - v.a! - v.t!,
          a: (v: Values) => 100 - v.r! - v.t!,
          t: (v: Values) => 100 - v.r! - v.a!,
        },
      },
    ],
    steps: {
      'r + a + t = 100': {
        r: { expr: '100 − {a} − {t}', how: 'Whatever is not absorbed or transmitted bounced off.' },
        a: {
          expr: '100 − {r} − {t}',
          how: 'Whatever is not reflected or transmitted was taken in, warming the material.',
        },
        t: {
          expr: '100 − {r} − {a}',
          how: 'Whatever is not reflected or absorbed passed through.',
        },
      },
    },
    example: { r: 8, a: 2, t: 90 },
    startWith: ['r', 'a'],
    representation: {
      kind: 'tape',
      parts: ['r', 'a', 't'],
      total: { value: 100, label: 'all the light' },
    },
  },
  // ── Reproduction and traits (MS-LS1-4, MS-LS3-2): chromosomes from two parents ──
  {
    id: 's.6.reproduction-traits',
    assumptions: [
      'In sexual reproduction each parent gives half of its chromosomes, so the offspring gets a mix of both.',
      'A body cell has chromosomes in pairs. An egg or sperm has one from each pair: half as many.',
      'Egg + sperm = the full set again. People: 23 + 23 = 46. Dogs: 39 + 39 = 78.',
      'Asexual reproduction copies one parent: every chromosome is the parent’s, so the offspring is a match.',
    ],
    variables: [
      whole('g', 'g', 'Chromosomes in an egg or sperm', 1, 200),
      { ...whole('b', 'b', 'Chromosomes in a body cell', 2, 400), step: 2, multipleOf: 2 },
    ],
    relations: [
      {
        id: 'b = 2 × g',
        display: '{g} + {g} = {b}',
        words: 'Chromosomes from the egg + chromosomes from the sperm = chromosomes in a body cell',
        vars: ['b', 'g'],
        residual: (v: Values) => v.b! - 2 * v.g!,
        solve: { b: (v: Values) => 2 * v.g!, g: (v: Values) => v.b! / 2 },
      },
    ],
    steps: {
      'b = 2 × g': {
        b: {
          expr: '{g} + {g}',
          how: 'The egg’s set and the sperm’s set join: one of each pair from each parent.',
        },
        g: {
          expr: '{b} ÷ 2',
          how: 'An egg or sperm carries one chromosome from each pair: half the body cell’s.',
        },
      },
    },
    example: { g: 23, b: 46 },
    startWith: ['g'],
    representation: {
      kind: 'tape',
      parts: ['g', 'g'],
      total: 'b',
      caption: 'Half from each parent: {g} + {g} = {b}.',
    },
  },
  // ── Earth's changing climate (MS-ESS3-5): carbon dioxide rising ──
  {
    id: 's.6.changing-climate',
    unitSystems: ['metric'],
    assumptions: [
      'Carbon dioxide in the air is measured in parts per million (ppm): how many of every million bits of air.',
      'Before factories it was about 280 ppm. Burning fuels adds more each year, and more carbon dioxide traps more heat.',
      'The yearly rise has grown: about 1 ppm a year in 1960, about 2.5 ppm a year now.',
      'Steady rise × years = the total rise; add it to the start.',
    ],
    variables: [
      {
        id: 's',
        symbol: 's',
        name: 'Carbon dioxide at the start',
        unit: 'ppm',
        min: 200,
        max: 1000,
        step: 0.1,
      },
      {
        id: 'r',
        symbol: 'r',
        name: 'Rise each year',
        unit: 'ppm/yr',
        min: 0.01,
        max: 10,
        step: 0.01,
      },
      { id: 'y', symbol: 'y', name: 'Years', unit: 'years', min: 1, max: 300, step: 1 },
      {
        id: 'c',
        symbol: 'c',
        name: 'Total rise',
        unit: 'ppm',
        min: 0,
        max: 1000,
        step: 0.1,
        derived: true,
      },
      {
        id: 'f',
        symbol: 'f',
        name: 'Carbon dioxide after',
        unit: 'ppm',
        min: 200,
        max: 2000,
        step: 0.1,
      },
    ],
    relations: [
      {
        id: 'c = r × y',
        display: '{r} × {y} = {c}',
        words: 'Rise each year × years = total rise',
        vars: ['c', 'r', 'y'],
        residual: (v: Values) => v.c! - v.r! * v.y!,
        solve: {
          c: (v: Values) => v.r! * v.y!,
          r: (v: Values) => div(v.c!, v.y!),
          y: (v: Values) => div(v.c!, v.r!),
        },
      },
      {
        id: 'f = s + c',
        display: '{s} + {c} = {f}',
        words: 'Carbon dioxide at the start + total rise = carbon dioxide after',
        vars: ['f', 's', 'c'],
        residual: (v: Values) => v.f! - v.s! - v.c!,
        solve: {
          f: (v: Values) => v.s! + v.c!,
          s: (v: Values) => v.f! - v.c!,
          c: (v: Values) => v.f! - v.s!,
        },
      },
    ],
    steps: {
      'c = r × y': {
        c: { expr: '{r} × {y}', how: 'The same rise every year, so multiply by the years.' },
        r: { expr: '{c} ÷ {y}', how: 'Share the total rise over the years.' },
        y: { expr: '{c} ÷ {r}', how: 'How many years of that rise make the total?' },
      },
      'f = s + c': {
        f: { expr: '{s} + {c}', how: 'Add the rise to the starting amount.' },
        s: { expr: '{f} − {c}', how: 'Take the rise away from the amount after.' },
        c: { expr: '{f} − {s}', how: 'The rise is after minus before.' },
      },
    },
    example: { s: 340, r: 2, y: 40, c: 80, f: 420 },
    startWith: ['s', 'r', 'y'],
    representation: {
      kind: 'plot',
      x: { var: 'y', min: 0, max: 100 },
      y: { var: 'f', min: 250, max: 600 },
      params: ['s', 'r'],
      autoRange: true,
    },
  },
  // ── Human impact (MS-ESS3-3): water saved by a shorter shower ──
  {
    id: 's.6.human-impact',
    unitSystems: ['metric'],
    assumptions: [
      'People use resources: water, energy, land. Using less of them is one way to lower our impact.',
      'A shower uses a steady number of liters each minute. Minutes cut × liters per minute = liters saved each day.',
      'Over many days the savings add up: liters saved each day × days = liters saved.',
    ],
    variables: [
      {
        id: 'm',
        symbol: 'm',
        name: 'Minutes cut from each shower',
        unit: 'min',
        min: 0.5,
        max: 30,
        step: 0.5,
      },
      {
        id: 'r',
        symbol: 'r',
        name: 'Liters each minute',
        unit: 'L/min',
        min: 1,
        max: 30,
        step: 0.1,
      },
      {
        id: 'd',
        symbol: 'd',
        name: 'Liters saved each day',
        unit: 'L',
        min: 0,
        max: 900,
        step: 0.1,
        derived: true,
      },
      whole('n', 'n', 'Days', 1, 3650),
      { id: 'w', symbol: 'w', name: 'Liters saved', unit: 'L', min: 0, max: 3000000, step: 0.1 },
    ],
    relations: [
      {
        id: 'd = m × r',
        display: '{m} × {r} = {d}',
        words: 'Minutes cut × liters each minute = liters saved each day',
        vars: ['d', 'm', 'r'],
        residual: (v: Values) => v.d! - v.m! * v.r!,
        solve: {
          d: (v: Values) => v.m! * v.r!,
          m: (v: Values) => div(v.d!, v.r!),
          r: (v: Values) => div(v.d!, v.m!),
        },
      },
      {
        id: 'w = d × n',
        display: '{d} × {n} = {w}',
        words: 'Liters saved each day × days = liters saved',
        vars: ['w', 'd', 'n'],
        residual: (v: Values) => v.w! - v.d! * v.n!,
        solve: {
          w: (v: Values) => v.d! * v.n!,
          d: (v: Values) => div(v.w!, v.n!),
          n: (v: Values) => div(v.w!, v.d!),
        },
      },
    ],
    steps: {
      'd = m × r': {
        d: { expr: '{m} × {r}', how: 'Each minute not showered saves that many liters.' },
        m: { expr: '{d} ÷ {r}', how: 'How many minutes of that flow make the daily saving?' },
        r: { expr: '{d} ÷ {m}', how: 'Share the daily saving over the minutes cut.' },
      },
      'w = d × n': {
        w: { expr: '{d} × {n}', how: 'The same saving every day, so multiply by the days.' },
        d: { expr: '{w} ÷ {n}', how: 'Share the total over the days.' },
        n: { expr: '{w} ÷ {d}', how: 'How many days of that saving make the total?' },
      },
    },
    example: { m: 2, r: 9, d: 18, n: 365, w: 6570 },
    startWith: ['m', 'r', 'n'],
    representation: {
      kind: 'table',
      sweep: 'n',
      output: 'w',
      params: ['d'],
      rows: [1, 7, 30, 90, 180, 365],
    },
  },
];
