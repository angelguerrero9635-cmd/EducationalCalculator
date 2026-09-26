/**
 * The picture gallery: one small module per picture kind that no lesson uses yet, so each
 * kind can be seen, dragged and screenshotted at /gallery before the section that needs it
 * is written. These are demonstrations, not lessons: they are not in the taxonomy, not in
 * search and not in the sitemap, but the module tests and the harness run over them.
 */
import type { Values } from '@/engine/types';

import { div, whole } from './math-k2';
import type { ModuleDef } from './types';
import { timesWork } from './work';

export const GALLERY_MODULES: ModuleDef[] = [
  {
    id: 'g.coordinate-plane',
    title: 'Coordinate plane',
    assumptions: [
      'A point is named by how far across (x) and how far up (y) it is.',
      'The slope of the line through two points is the rise divided by the run.',
      'The second point is to the right of the first.',
    ],
    variables: [
      whole('x1', 'x₁', 'First x', 0, 10),
      whole('y1', 'y₁', 'First y', 0, 10),
      whole('x2', 'x₂', 'Second x', 1, 10),
      whole('y2', 'y₂', 'Second y', 0, 10),
      { id: 'm', symbol: 'm', name: 'Slope', min: -10, max: 10, step: 0.01 },
    ],
    relations: [
      {
        id: 'x₂ > x₁',
        constraint: true,
        display: '{x2} is to the right of {x1}',
        vars: ['x2', 'x1'],
        residual: (v: Values) => (v.x2! > v.x1! ? 0 : 1),
        solve: {},
      },
      {
        id: 'm = rise ÷ run',
        display: '{m} = ({y2} − {y1}) ÷ ({x2} − {x1})',
        vars: ['m', 'y2', 'y1', 'x2', 'x1'],
        residual: (v: Values) => v.m! * (v.x2! - v.x1!) - (v.y2! - v.y1!),
        solve: {
          m: (v: Values) => div(v.y2! - v.y1!, v.x2! - v.x1!),
          y2: (v: Values) => v.y1! + v.m! * (v.x2! - v.x1!),
          y1: (v: Values) => v.y2! - v.m! * (v.x2! - v.x1!),
          x2: () => undefined,
          x1: () => undefined,
        },
      },
    ],
    steps: {
      'x₂ > x₁': {},
      'm = rise ÷ run': {
        m: {
          expr: '({y2} − {y1}) ÷ ({x2} − {x1})',
          how: 'The rise is the change in y, the run the change in x. Divide rise by run.',
        },
        y2: {
          expr: '{y1} + {m} × ({x2} − {x1})',
          how: 'Add the rise, slope times run, to the first y.',
        },
        y1: {
          expr: '{y2} − {m} × ({x2} − {x1})',
          how: 'Take the rise, slope times run, from the second y.',
        },
      },
    },
    example: { x1: 1, y1: 2, x2: 4, y2: 8, m: 2 },
    startWith: ['x1', 'y1', 'x2', 'y2'],
    representation: {
      kind: 'coordinatePlane',
      x: 'x1',
      y: 'y1',
      second: { x: 'x2', y: 'y2' },
      slope: 'm',
      extent: 10,
      quadrants: 1,
    },
  },
  {
    id: 'g.box-plot',
    title: 'Box plot',
    assumptions: [
      'Five numbers describe the data: least, first quartile, median, third quartile, greatest.',
      'The box holds the middle half of the data. Its width is the interquartile range.',
      'The five numbers go in order from least to greatest.',
    ],
    variables: [
      whole('a', 'a', 'Least', 0, 50),
      whole('b', 'b', 'First quartile', 0, 50),
      whole('c', 'c', 'Median', 0, 50),
      whole('d', 'd', 'Third quartile', 0, 50),
      whole('e', 'e', 'Greatest', 0, 50),
      { ...whole('r', 'r', 'Range', 0, 50), derived: true },
      { ...whole('i', 'i', 'Interquartile range', 0, 50), derived: true },
    ],
    relations: [
      // Every pair in order, so a value out of place is caught whatever else is known.
      ...(
        [
          ['a', 'b'],
          ['a', 'c'],
          ['a', 'd'],
          ['a', 'e'],
          ['b', 'c'],
          ['b', 'd'],
          ['b', 'e'],
          ['c', 'd'],
          ['c', 'e'],
          ['d', 'e'],
        ] as const
      ).map(([lo, hi]) => ({
        id: `${lo} ≤ ${hi}`,
        constraint: true,
        display: `{${lo}} is at most {${hi}}`,
        vars: [lo, hi],
        residual: (v: Values) => (v[lo]! <= v[hi]! ? 0 : 1),
        solve: {},
      })),
      {
        id: 'r = e − a',
        display: '{e} − {a} = {r}',
        vars: ['r', 'e', 'a'],
        residual: (v: Values) => v.r! - v.e! + v.a!,
        solve: {
          r: (v: Values) => v.e! - v.a!,
          e: (v: Values) => v.a! + v.r!,
          a: (v: Values) => v.e! - v.r!,
        },
      },
      {
        id: 'i = d − b',
        display: '{d} − {b} = {i}',
        vars: ['i', 'd', 'b'],
        residual: (v: Values) => v.i! - v.d! + v.b!,
        solve: {
          i: (v: Values) => v.d! - v.b!,
          d: (v: Values) => v.b! + v.i!,
          b: (v: Values) => v.d! - v.i!,
        },
      },
    ],
    steps: {
      'a ≤ b': {},
      'a ≤ c': {},
      'a ≤ d': {},
      'a ≤ e': {},
      'b ≤ c': {},
      'b ≤ d': {},
      'b ≤ e': {},
      'c ≤ d': {},
      'c ≤ e': {},
      'd ≤ e': {},
      'r = e − a': {
        r: { expr: '{e} − {a}', how: 'The range is the greatest value take away the least.' },
        e: { expr: '{a} + {r}', how: 'Add the range to the least value.' },
        a: { expr: '{e} − {r}', how: 'Take the range from the greatest value.' },
      },
      'i = d − b': {
        i: {
          expr: '{d} − {b}',
          how: 'The interquartile range is the third quartile take away the first.',
        },
        d: { expr: '{b} + {i}', how: 'Add the interquartile range to the first quartile.' },
        b: { expr: '{d} − {i}', how: 'Take the interquartile range from the third quartile.' },
      },
    },
    example: { a: 2, b: 5, c: 8, d: 12, e: 15, r: 13, i: 7 },
    startWith: ['a', 'b', 'c', 'd', 'e'],
    representation: {
      kind: 'boxPlot',
      min: 'a',
      q1: 'b',
      median: 'c',
      q3: 'd',
      max: 'e',
      range: [0, 20],
    },
  },
  {
    id: 'g.pie-chart',
    title: 'Pie chart',
    assumptions: [
      'Each part is a percent of the whole. The parts add to 100%.',
      'A bigger percent is a bigger slice of the pie.',
    ],
    variables: [
      { ...whole('a', 'a', 'Walk', 0, 100), unit: '%' },
      { ...whole('b', 'b', 'Bus', 0, 100), unit: '%' },
      { ...whole('c', 'c', 'Car', 0, 100), unit: '%' },
    ],
    relations: [
      {
        id: 'a + b + c = 100',
        display: '{a} + {b} + {c} = 100',
        vars: ['a', 'b', 'c'],
        residual: (v: Values) => v.a! + v.b! + v.c! - 100,
        solve: {
          a: (v: Values) => 100 - v.b! - v.c!,
          b: (v: Values) => 100 - v.a! - v.c!,
          c: (v: Values) => 100 - v.a! - v.b!,
        },
      },
    ],
    steps: {
      'a + b + c = 100': {
        a: {
          expr: '100 − {b} − {c}',
          how: 'The parts make 100%. Take the other two away from 100.',
        },
        b: {
          expr: '100 − {a} − {c}',
          how: 'The parts make 100%. Take the other two away from 100.',
        },
        c: {
          expr: '100 − {a} − {b}',
          how: 'The parts make 100%. Take the other two away from 100.',
        },
      },
    },
    example: { a: 50, b: 30, c: 20 },
    startWith: ['a', 'b'],
    representation: { kind: 'pieChart', parts: ['a', 'b', 'c'] },
  },
  {
    id: 'g.fraction-area',
    title: 'Fraction of a fraction',
    assumptions: [
      'To multiply fractions, multiply the tops and multiply the bottoms.',
      'The square shows why: columns for one fraction, rows for the other, and the overlap.',
      'Each fraction is at most 1.',
    ],
    variables: [
      whole('a', 'a', 'First top', 1, 6),
      whole('b', 'b', 'First bottom', 2, 6),
      whole('c', 'c', 'Second top', 1, 6),
      whole('d', 'd', 'Second bottom', 2, 6),
      { ...whole('p', 'p', 'Product top', 1, 36), derived: true },
      { ...whole('q', 'q', 'Product bottom', 4, 36), derived: true },
    ],
    relations: [
      {
        id: 'a ≤ b',
        constraint: true,
        display: '{a}/{b} is at most 1',
        vars: ['a', 'b'],
        residual: (v: Values) => (v.a! <= v.b! ? 0 : 1),
        solve: {},
      },
      {
        id: 'c ≤ d',
        constraint: true,
        display: '{c}/{d} is at most 1',
        vars: ['c', 'd'],
        residual: (v: Values) => (v.c! <= v.d! ? 0 : 1),
        solve: {},
      },
      {
        id: 'p = a × c',
        display: '{a} × {c} = {p}',
        vars: ['p', 'a', 'c'],
        residual: (v: Values) => v.p! - v.a! * v.c!,
        solve: {
          p: (v: Values) => v.a! * v.c!,
          a: (v: Values) => div(v.p!, v.c!),
          c: (v: Values) => div(v.p!, v.a!),
        },
      },
      {
        id: 'q = b × d',
        display: '{b} × {d} = {q}',
        check: (v: Values) =>
          [v.a, v.b, v.c, v.d, v.p, v.q].every((x) => x !== undefined)
            ? `${v.a}/${v.b} × ${v.c}/${v.d} = ${v.p}/${v.q}`
            : `${v.b} × ${v.d} = ${v.q}`,
        vars: ['q', 'b', 'd'],
        residual: (v: Values) => v.q! - v.b! * v.d!,
        solve: {
          q: (v: Values) => v.b! * v.d!,
          b: (v: Values) => div(v.q!, v.d!),
          d: (v: Values) => div(v.q!, v.b!),
        },
      },
    ],
    steps: {
      'a ≤ b': {},
      'c ≤ d': {},
      'p = a × c': {
        p: {
          expr: '{a} × {c}',
          how: 'Multiply the tops: the shaded columns times the shaded rows.',
          work: (v) => timesWork(v.a!, v.c!),
        },
        a: { expr: '{p} ÷ {c}', how: 'Divide the product top by the second top.' },
        c: { expr: '{p} ÷ {a}', how: 'Divide the product top by the first top.' },
      },
      'q = b × d': {
        q: {
          expr: '{b} × {d}',
          how: 'Multiply the bottoms: all the columns times all the rows.',
          work: (v) => timesWork(v.b!, v.d!),
        },
        b: { expr: '{q} ÷ {d}', how: 'Divide the product bottom by the second bottom.' },
        d: { expr: '{q} ÷ {b}', how: 'Divide the product bottom by the first bottom.' },
      },
    },
    example: { a: 2, b: 3, c: 3, d: 4, p: 6, q: 12 },
    startWith: ['a', 'b', 'c', 'd'],
    representation: {
      kind: 'fractionArea',
      first: { num: 'a', den: 'b' },
      second: { num: 'c', den: 'd' },
      product: { num: 'p', den: 'q' },
    },
  },
  {
    id: 'g.unit-cubes',
    title: 'Volume with unit cubes',
    assumptions: [
      'A layer has length × width cubes. The box has that many in each layer.',
      'Volume = length × width × height, counted in unit cubes.',
    ],
    variables: [
      whole('l', 'l', 'Length', 1, 6),
      whole('w', 'w', 'Width', 1, 6),
      whole('h', 'h', 'Height', 1, 6),
      whole('V', 'V', 'Volume', 1, 216),
    ],
    relations: [
      {
        id: 'V = l × w × h',
        display: '{l} × {w} × {h} = {V}',
        vars: ['V', 'l', 'w', 'h'],
        residual: (v: Values) => v.V! - v.l! * v.w! * v.h!,
        solve: {
          V: (v: Values) => v.l! * v.w! * v.h!,
          l: (v: Values) => div(v.V!, v.w! * v.h!),
          w: (v: Values) => div(v.V!, v.l! * v.h!),
          h: (v: Values) => div(v.V!, v.l! * v.w!),
        },
      },
    ],
    steps: {
      'V = l × w × h': {
        V: {
          expr: '{l} × {w} × {h}',
          how: 'Count one layer, then multiply by the number of layers.',
          work: (v) => [
            `One layer: ${v.l} × ${v.w} = ${v.l! * v.w!}`,
            `${v.l! * v.w!} × ${v.h} = ${v.V}`,
          ],
        },
        l: { expr: '{V} ÷ ({w} × {h})', how: 'Divide the volume by the width times the height.' },
        w: { expr: '{V} ÷ ({l} × {h})', how: 'Divide the volume by the length times the height.' },
        h: { expr: '{V} ÷ ({l} × {w})', how: 'Divide the volume by the cubes in one layer.' },
      },
    },
    example: { l: 4, w: 3, h: 2, V: 24 },
    startWith: ['l', 'w', 'h'],
    representation: {
      kind: 'unitCubes',
      length: 'l',
      width: 'w',
      height: 'h',
      volume: 'V',
      max: 6,
    },
  },
  {
    id: 'g.place-value-chart',
    title: 'Place-value chart',
    assumptions: [
      'Each place is 10 times the place to its right.',
      'Multiplying by 10 moves every digit one place to the left.',
    ],
    variables: [
      { id: 'n', symbol: 'n', name: 'Number', min: 0, max: 9999.99, step: 0.01 },
      { id: 't', symbol: 't', name: 'Ten times the number', min: 0, max: 99999.9, step: 0.1 },
    ],
    relations: [
      {
        id: 't = 10 × n',
        display: '10 × {n} = {t}',
        vars: ['t', 'n'],
        residual: (v: Values) => v.t! - 10 * v.n!,
        solve: { t: (v: Values) => 10 * v.n!, n: (v: Values) => v.t! / 10 },
      },
    ],
    steps: {
      't = 10 × n': {
        t: { expr: '10 × {n}', how: 'Every digit moves one place to the left.' },
        n: { expr: '{t} ÷ 10', how: 'Every digit moves one place to the right.' },
      },
    },
    example: { n: 347.25, t: 3472.5 },
    startWith: ['n'],
    representation: { kind: 'placeValueChart', value: 'n', decimals: 2 },
  },
  {
    id: 'g.wave',
    title: 'Wave',
    assumptions: [
      'Wavelength is the distance from one crest to the next.',
      'Wave speed = frequency × wavelength.',
    ],
    variables: [
      whole('L', 'λ', 'Wavelength', 1, 10),
      whole('f', 'f', 'Frequency', 1, 20),
      whole('v', 'v', 'Wave speed', 1, 200),
    ],
    relations: [
      {
        id: 'v = f × λ',
        display: '{f} × {L} = {v}',
        vars: ['v', 'f', 'L'],
        residual: (v: Values) => v.v! - v.f! * v.L!,
        solve: {
          v: (v: Values) => v.f! * v.L!,
          f: (v: Values) => div(v.v!, v.L!),
          L: (v: Values) => div(v.v!, v.f!),
        },
      },
    ],
    steps: {
      'v = f × λ': {
        v: { expr: '{f} × {L}', how: 'Each second, f wavelengths go by: multiply.' },
        f: { expr: '{v} ÷ {L}', how: 'Divide the speed by the wavelength.' },
        L: { expr: '{v} ÷ {f}', how: 'Divide the speed by the frequency.' },
      },
    },
    example: { L: 4, f: 2, v: 8 },
    startWith: ['L', 'f'],
    representation: { kind: 'wave', wavelength: 'L', extent: 3, frequency: 'f' },
  },
  {
    id: 'g.punnett-square',
    title: 'Punnett square',
    assumptions: [
      'Each parent gives one of its two alleles. The square shows every pairing.',
      'A capital letter is the dominant allele: one is enough to show the trait.',
      'Set each parent by how many dominant alleles it has: 0, 1 or 2.',
    ],
    variables: [
      { ...whole('p', 'p', 'Dominant alleles in parent 1', 0, 2), allowed: [0, 1, 2] },
      { ...whole('q', 'q', 'Dominant alleles in parent 2', 0, 2), allowed: [0, 1, 2] },
      whole('d', 'd', 'Offspring showing the trait (of 4)', 0, 4),
      { ...whole('r', 'r', 'Offspring not showing it (of 4)', 0, 4), derived: true },
    ],
    relations: [
      {
        id: 'd = 4 − (2 − p) × (2 − q)',
        display: '4 − (2 − {p}) × (2 − {q}) = {d}',
        vars: ['d', 'p', 'q'],
        residual: (v: Values) => v.d! - (4 - (2 - v.p!) * (2 - v.q!)),
        // Several parent pairs give the same count: the parents aren't found from it.
        solve: {
          d: (v: Values) => 4 - (2 - v.p!) * (2 - v.q!),
          p: () => undefined,
          q: () => undefined,
        },
      },
      {
        id: 'r = 4 − d',
        display: '4 − {d} = {r}',
        vars: ['r', 'd'],
        residual: (v: Values) => v.r! - 4 + v.d!,
        solve: { r: (v: Values) => 4 - v.d!, d: (v: Values) => 4 - v.r! },
      },
    ],
    steps: {
      'd = 4 − (2 − p) × (2 − q)': {
        d: {
          expr: '4 − (2 − {p}) × (2 − {q})',
          how: 'Boxes with no capital letter get a small allele from each parent. The rest show the trait.',
          work: (v) => [
            `Small alleles: parent 1 has ${2 - v.p!}, parent 2 has ${2 - v.q!}`,
            `Boxes with two small alleles: ${2 - v.p!} × ${2 - v.q!} = ${(2 - v.p!) * (2 - v.q!)}`,
            `4 − ${(2 - v.p!) * (2 - v.q!)} = ${v.d}`,
          ],
        },
      },
      'r = 4 − d': {
        r: { expr: '4 − {d}', how: 'The other boxes do not show the trait.' },
        d: { expr: '4 − {r}', how: 'The other boxes show the trait.' },
      },
    },
    example: { p: 1, q: 1, d: 3, r: 1 },
    startWith: ['p', 'q'],
    representation: {
      kind: 'punnettSquare',
      first: 'p',
      second: 'q',
      dominant: 'd',
      recessive: 'r',
      letter: 'B',
    },
  },
];
