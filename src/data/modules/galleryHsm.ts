/**
 * Grades 9–12 gallery demos (group HM: the equation-input parts H81–H88; see
 * pictureRequestsHs.ts and docs/EQUATION_INPUTS.md). Each demo is a page stand-in whose equation
 * input uses the new part. Spread into gallery.ts.
 */
import { formatNumber } from '@/engine/format';
import type { Values } from '@/engine/types';

import { div } from './helpers';
import type { LayoutDef } from './layouts';
import { MATH_5_MODULES } from './math/5';
import { MATH_7_MODULES } from './math/7';
import { MATH_8_MODULES } from './math/8';
import { SCIENCE_7_MODULES } from './science/7';
import type { ModuleDef } from './types';

const exact = (x: number) => Number(x.toPrecision(12));
const fmt = (x: number) => formatNumber(x);
/** A negative number in brackets, as written after a sign: 3 − (−2). */
const paren = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x));

/** A K–8 page as a gallery demo `id`, taking the equation it couldn't draw before. */
function fromPage(pageId: string, id: string, title: string, extra: Partial<ModuleDef>) {
  const page = [...MATH_5_MODULES, ...MATH_7_MODULES, ...MATH_8_MODULES, ...SCIENCE_7_MODULES].find(
    (m) => m.id === pageId,
  );
  if (!page) throw new Error(`galleryHsm: no page ${pageId}`);
  return { ...page, id, title, ...extra };
}
const RAD = Math.PI / 180;
const sin = (deg: number) => Math.sin(deg * RAD);

/** A value with a range (decimals allowed). */
const value = (id: string, name: string, min: number, max: number, extra: object = {}) => ({
  id,
  symbol: id,
  name,
  min,
  max,
  ...extra,
});

// H81: expression slots (a fraction's top or bottom, an exponent: boxes, text and signs).
const H81: ModuleDef[] = [
  {
    id: 'g.m10-law-sines-cosines-sines',
    title: 'Law of sines: a side from two angles',
    use: 'Use this for “In triangle ABC, A = 40°, B = 65° and a = 12. Find b.”',
    assumptions: [
      'Each side is across from the angle with the same letter.',
      'A side divided by the sine of its angle is the same for all three sides.',
      'The three angles add to 180°.',
    ],
    variables: [
      value('a', 'Side a', 0.1, 1000),
      value('A', 'Angle A', 1, 178, { unit: '°' }),
      value('b', 'Side b', 0.1, 1000),
      value('B', 'Angle B', 1, 178, { unit: '°' }),
      { ...value('C', 'Angle C', 1, 178, { unit: '°' }), derived: true },
      { ...value('E', 'Exterior angle at C', 2, 179, { unit: '°' }), derived: true },
    ],
    relations: [
      {
        id: 'a ÷ sin A = b ÷ sin B',
        display: '{a} ÷ sin {A}° = {b} ÷ sin {B}°',
        vars: ['a', 'A', 'b', 'B'],
        residual: (v: Values) => v.a! * sin(v.B!) - v.b! * sin(v.A!),
        solve: {
          b: (v: Values) => exact((v.a! * sin(v.B!)) / sin(v.A!)),
          a: (v: Values) => exact((v.b! * sin(v.A!)) / sin(v.B!)),
          A: () => undefined,
          B: () => undefined,
        },
      },
      {
        id: 'A + B + C = 180',
        display: '{A} + {B} + {C} = 180',
        vars: ['A', 'B', 'C'],
        residual: (v: Values) => v.A! + v.B! + v.C! - 180,
        solve: {
          C: (v: Values) => 180 - v.A! - v.B!,
          A: (v: Values) => 180 - v.B! - v.C!,
          B: (v: Values) => 180 - v.A! - v.C!,
        },
      },
      {
        id: 'E + C = 180',
        display: '{E} + {C} = 180',
        vars: ['E', 'C'],
        residual: (v: Values) => v.E! + v.C! - 180,
        solve: { E: (v: Values) => 180 - v.C!, C: (v: Values) => 180 - v.E! },
      },
    ],
    steps: {
      'a ÷ sin A = b ÷ sin B': {
        b: {
          expr: '{a} × sin {B}° ÷ sin {A}°',
          how: 'Multiply both sides by sin B to get b alone.',
        },
        a: {
          expr: '{b} × sin {A}° ÷ sin {B}°',
          how: 'Multiply both sides by sin A to get a alone.',
        },
      },
      'A + B + C = 180': {
        C: { expr: '180 − {A} − {B}', how: 'The three angles make 180°.' },
        A: { expr: '180 − {B} − {C}', how: 'The three angles make 180°.' },
        B: { expr: '180 − {A} − {C}', how: 'The three angles make 180°.' },
      },
      'E + C = 180': {
        E: { expr: '180 − {C}', how: 'The exterior angle and C make a straight line.' },
        C: { expr: '180 − {E}', how: 'The exterior angle and C make a straight line.' },
      },
    },
    example: { a: 12, A: 40, B: 65, b: 16.9195754251, C: 75, E: 105 },
    startWith: ['a', 'A', 'B'],
    equation: '{a}/{sin({A}°)} = {b}/{sin({B}°)}',
    representation: {
      kind: 'angles',
      parts: ['A', 'B'],
      whole: 'E',
      triangle: { third: 'C' },
    },
  },
  {
    id: 'g.m11-normal-distribution-z',
    title: 'z-score: how many standard deviations',
    use: 'Use this for “Scores have mean 70 and standard deviation 8. What is the z-score of 82?”',
    assumptions: [
      'The mean μ is the middle of the distribution; σ is its standard deviation.',
      'A z-score counts standard deviations from the mean: above it is positive.',
    ],
    variables: [
      value('z', 'z-score', -6, 6),
      value('x', 'Value', -100000, 100000),
      value('m', 'Mean μ', -100000, 100000),
      value('s', 'Standard deviation σ', 0.001, 100000),
    ],
    relations: [
      {
        id: 'z = (x − μ) ÷ σ',
        display: '{z} = ({x} − {m}) ÷ {s}',
        vars: ['z', 'x', 'm', 's'],
        residual: (v: Values) => v.z! * v.s! - (v.x! - v.m!),
        solve: {
          z: (v: Values) => exact((v.x! - v.m!) / v.s!),
          x: (v: Values) => exact(v.m! + v.z! * v.s!),
          m: (v: Values) => exact(v.x! - v.z! * v.s!),
          s: (v: Values) => (v.z === 0 ? undefined : exact((v.x! - v.m!) / v.z!)),
        },
      },
    ],
    steps: {
      'z = (x − μ) ÷ σ': {
        z: { expr: '({x} − {m}) ÷ {s}', how: 'Find how far x is from the mean, then divide by σ.' },
        x: { expr: '{m} + {z} × {s}', how: 'Go z standard deviations from the mean.' },
        m: { expr: '{x} − {z} × {s}', how: 'Go back z standard deviations from x.' },
        s: { expr: '({x} − {m}) ÷ {z}', how: 'Divide the distance from the mean by z.' },
      },
    },
    example: { z: 1.5, x: 82, m: 70, s: 8 },
    startWith: ['x', 'm', 's'],
    equation: '{z} = {{x} − {m}}/{s}',
    representation: { kind: 'integerLine', value: 'z', min: -4, max: 4 },
  },
  {
    id: 'g.m9-sequences-geometric',
    title: 'Geometric sequence: the nth term',
    use: 'Use this for “A geometric sequence starts 3, 6, 12, … What is the 8th term?”',
    assumptions: [
      'Each term is the one before it times the common ratio r.',
      'The nth term is the first term times r, n − 1 times.',
    ],
    variables: [
      value('an', 'nth term', -1e15, 1e15),
      value('a1', 'First term', -10000, 10000),
      value('r', 'Common ratio', 0.1, 10),
      { ...value('n', 'Term number', 1, 15), integer: true },
    ],
    relations: [
      {
        id: 'aₙ = a₁ × r^(n − 1)',
        display: '{an} = {a1} × {r}^({n} − 1)',
        vars: ['an', 'a1', 'r', 'n'],
        residual: (v: Values) => v.an! - v.a1! * v.r! ** (v.n! - 1),
        solve: {
          an: (v: Values) => exact(v.a1! * v.r! ** (v.n! - 1)),
          a1: (v: Values) => div(v.an!, v.r! ** (v.n! - 1)),
          r: (v: Values) => {
            const q = div(v.an!, v.a1!);
            if (q === undefined || q <= 0 || v.n! < 2) return undefined;
            return exact(q ** (1 / (v.n! - 1)));
          },
          n: (v: Values) => {
            const q = div(v.an!, v.a1!);
            if (q === undefined || q <= 0 || v.r! <= 0 || v.r === 1) return undefined;
            const n = 1 + Math.log(q) / Math.log(v.r!);
            return Math.abs(n - Math.round(n)) < 1e-9 ? Math.round(n) : exact(n);
          },
        },
      },
    ],
    steps: {
      'aₙ = a₁ × r^(n − 1)': {
        an: {
          expr: '{a1} × {r}^({n} − 1)',
          how: 'Multiply the first term by r once for each step after it.',
        },
        a1: { expr: '{an} ÷ {r}^({n} − 1)', how: 'Undo the n − 1 steps: divide by r that often.' },
        r: {
          expr: '({an} ÷ {a1})^(1 ÷ ({n} − 1))',
          how: 'Divide by the first term, then take the (n − 1)th root.',
        },
        n: {
          expr: '1 + ln({an} ÷ {a1}) ÷ ln({r})',
          how: 'Divide by the first term, take ln of both sides, divide by ln r, then add 1.',
        },
      },
    },
    example: { an: 384, a1: 3, r: 2, n: 8 },
    startWith: ['a1', 'r', 'n'],
    equation: 'aₙ = {a1} × {r}^{{n} − 1} = {an}',
    representation: {
      kind: 'table',
      sweep: 'n',
      output: 'an',
      params: ['a1', 'r'],
      rows: [1, 2, 3, 4, 5, 6, 7, 8],
    },
  },
  {
    id: 'g.m11-exp-log-equations-continuous',
    title: 'Continuous growth: A = Pe^rt',
    use: 'Use this for “$500 grows at 5% a year, compounded continuously. How much after 10 years?”',
    assumptions: [
      'Compounded continuously, an amount grows by the factor e^rt.',
      'The rate r is written as a decimal: 5% is 0.05.',
      'Take ln of both sides to bring t or r down from the exponent.',
    ],
    variables: [
      value('A', 'Amount', 0.01, 1e9),
      value('P', 'Starting amount', 0.01, 1e9),
      value('r', 'Rate (decimal)', -1, 1),
      value('t', 'Time (years)', 0, 200),
    ],
    relations: [
      {
        id: 'A = P × e^(r × t)',
        display: '{A} = {P} × e^({r} × {t})',
        vars: ['A', 'P', 'r', 't'],
        residual: (v: Values) => v.A! - v.P! * Math.exp(v.r! * v.t!),
        solve: {
          A: (v: Values) => exact(v.P! * Math.exp(v.r! * v.t!)),
          P: (v: Values) => exact(v.A! / Math.exp(v.r! * v.t!)),
          t: (v: Values) => (v.r ? exact(Math.log(v.A! / v.P!) / v.r) : undefined),
          r: (v: Values) => (v.t ? exact(Math.log(v.A! / v.P!) / v.t) : undefined),
        },
      },
    ],
    steps: {
      'A = P × e^(r × t)': {
        A: { expr: '{P} × e^({r} × {t})', how: 'Raise e to r × t, then multiply by P.' },
        P: { expr: '{A} ÷ e^({r} × {t})', how: 'Divide the amount by the growth factor.' },
        t: { expr: 'ln({A} ÷ {P}) ÷ {r}', how: 'Divide by P, take ln of both sides, divide by r.' },
        r: { expr: 'ln({A} ÷ {P}) ÷ {t}', how: 'Divide by P, take ln of both sides, divide by t.' },
      },
    },
    example: { A: 824.36063535, P: 500, r: 0.05, t: 10 },
    startWith: ['P', 'r', 't'],
    equation: '{A} = {P}e^{{r}{t}}',
    representation: {
      kind: 'plot',
      x: { var: 't', min: 0, max: 20, label: 't (years)' },
      y: { var: 'A', min: 0, max: 1500, label: 'A' },
      params: ['P', 'r'],
      autoRange: true,
    },
  },
  {
    id: 'g.s10-measurement-factor',
    title: 'Unit factor: kilometers to meters',
    use: 'Use this for “A trail is 3.2 km long. How many meters is it?”',
    assumptions: [
      '1 km = 1000 m, so 1000 m/1 km is 1: multiplying by it changes only the unit.',
      'The km on top and bottom cancel, leaving meters.',
    ],
    variables: [value('a', 'Kilometers', 0.001, 100000), value('b', 'Meters', 1, 1e8)],
    relations: [
      {
        id: 'b = a × 1000',
        display: '{a} × 1000 = {b}',
        vars: ['a', 'b'],
        residual: (v: Values) => v.b! - v.a! * 1000,
        solve: {
          b: (v: Values) => exact(v.a! * 1000),
          a: (v: Values) => exact(v.b! / 1000),
        },
      },
    ],
    steps: {
      'b = a × 1000': {
        b: { expr: '{a} × 1000', how: 'Multiply by 1000 m over 1 km: the km cancel.' },
        a: { expr: '{b} ÷ 1000', how: 'Multiply by 1 km over 1000 m: the m cancel.' },
      },
    },
    example: { a: 3.2, b: 3200 },
    startWith: ['a'],
    equation: '{a} km × {1000 m}/{1 km} = {b} m',
    representation: { kind: 'table', sweep: 'a', output: 'b', params: [], rows: [1, 2, 3, 4, 5] },
  },
  {
    id: 'g.s10-mole-factor',
    title: 'Unit factor: grams to moles',
    use: 'Use this for “How many moles are in 90 g of water (18 g/mol)?”',
    assumptions: [
      'The molar mass M is the mass of 1 mol, in grams.',
      '1 mol/M g is a unit factor: the grams cancel, leaving moles.',
    ],
    variables: [
      value('m', 'Mass (g)', 0.001, 1e6),
      value('M', 'Molar mass (g/mol)', 1, 1000),
      value('n', 'Amount (mol)', 0.00001, 1e6),
    ],
    relations: [
      {
        id: 'n = m ÷ M',
        display: '{n} = {m} ÷ {M}',
        vars: ['n', 'm', 'M'],
        residual: (v: Values) => v.n! * v.M! - v.m!,
        solve: {
          n: (v: Values) => exact(v.m! / v.M!),
          m: (v: Values) => exact(v.n! * v.M!),
          M: (v: Values) => div(v.m!, v.n!),
        },
      },
    ],
    steps: {
      'n = m ÷ M': {
        n: { expr: '{m} ÷ {M}', how: 'Multiply by 1 mol over M grams: the grams cancel.' },
        m: { expr: '{n} × {M}', how: 'Each mole has a mass of M grams.' },
        M: { expr: '{m} ÷ {n}', how: 'Divide the grams by the moles.' },
      },
    },
    example: { m: 90, M: 18, n: 5 },
    startWith: ['m', 'M'],
    equation: '{m} g × {1 mol}/{{M} g} = {n} mol',
    representation: {
      kind: 'table',
      sweep: 'm',
      output: 'n',
      params: ['M'],
      rows: [18, 36, 54, 72, 90],
    },
  },
  {
    id: 'g.m12-conics-ellipse',
    title: 'Ellipse: a point on it',
    use: 'Use this for “Find y on (x − 1)²/25 + (y − 2)²/9 = 1 when x = 4.”',
    assumptions: [
      'The center is (h, k); a is the half-width and b the half-height.',
      'A point is on the ellipse when the two fractions add to 1.',
      'Two points share each x: one above the center and one below.',
    ],
    variables: [
      value('x', 'x', -1000, 1000),
      value('h', 'Center x (h)', -1000, 1000),
      value('a', 'Half-width a', 0.01, 1000),
      value('y', 'y', -1000, 1000),
      value('k', 'Center y (k)', -1000, 1000),
      value('b', 'Half-height b', 0.01, 1000),
    ],
    relations: [
      {
        id: '(x − h)² ÷ a² + (y − k)² ÷ b² = 1',
        display: '({x} − {h})^2 ÷ {a}^2 + ({y} − {k})^2 ÷ {b}^2 = 1',
        vars: ['x', 'h', 'a', 'y', 'k', 'b'],
        residual: (v: Values) =>
          (v.x! - v.h!) ** 2 / v.a! ** 2 + (v.y! - v.k!) ** 2 / v.b! ** 2 - 1,
        solve: {
          y: (v: Values) => {
            const left = 1 - (v.x! - v.h!) ** 2 / v.a! ** 2;
            if (left < 0) return undefined;
            const d = v.b! * Math.sqrt(left);
            return [exact(v.k! + d), exact(v.k! - d)];
          },
          x: (v: Values) => {
            const left = 1 - (v.y! - v.k!) ** 2 / v.b! ** 2;
            if (left < 0) return undefined;
            const d = v.a! * Math.sqrt(left);
            return [exact(v.h! + d), exact(v.h! - d)];
          },
          h: () => undefined,
          k: () => undefined,
          a: () => undefined,
          b: () => undefined,
        },
      },
    ],
    steps: {
      '(x − h)² ÷ a² + (y − k)² ÷ b² = 1': {
        y: {
          expr: '{k} ± {b} × √(1 − ({x} − {h})^2 ÷ {a}^2)',
          how: 'Take the x fraction from 1, multiply by b², then take the square root.',
        },
        x: {
          expr: '{h} ± {a} × √(1 − ({y} − {k})^2 ÷ {b}^2)',
          how: 'Take the y fraction from 1, multiply by a², then take the square root.',
        },
      },
    },
    example: { x: 4, h: 1, a: 5, y: 4.4, k: 2, b: 3 },
    startWith: ['x', 'h', 'a', 'k', 'b'],
    equation: '{({x} − {h})²}/{a}^2 + {({y} − {k})²}/{b}^2 = 1',
    representation: {
      kind: 'coordinatePlane',
      x: 'x',
      y: 'y',
      second: { x: 'h', y: 'k' },
      segment: true,
      extent: 8,
      quadrants: 4,
    },
  },
];

// H82: an exponent on a bracketed group, the brackets drawn.
const H82: ModuleDef[] = [
  {
    id: 'g.m9-exponential-functions-compound',
    title: 'Compound interest: A = P(1 + r)^t',
    use: 'Use this for “$2,000 earns 4% a year, compounded yearly. How much after 8 years?”',
    assumptions: [
      'Each year the amount is multiplied by 1 + r, the rate r as a decimal.',
      'After t years it has been multiplied by 1 + r, t times.',
      'Take logs of both sides to bring t down from the exponent.',
    ],
    variables: [
      value('A', 'Amount', 0.01, 1e9),
      value('P', 'Starting amount', 0.01, 1e9),
      value('r', 'Rate (decimal)', 0.0001, 1),
      value('t', 'Years', 0, 100),
    ],
    relations: [
      {
        id: 'A = P × (1 + r)^t',
        display: '{A} = {P} × (1 + {r})^{t}',
        vars: ['A', 'P', 'r', 't'],
        residual: (v: Values) => v.A! - v.P! * (1 + v.r!) ** v.t!,
        solve: {
          A: (v: Values) => exact(v.P! * (1 + v.r!) ** v.t!),
          P: (v: Values) => exact(v.A! / (1 + v.r!) ** v.t!),
          t: (v: Values) => exact(Math.log(v.A! / v.P!) / Math.log(1 + v.r!)),
          r: (v: Values) => (v.t ? exact((v.A! / v.P!) ** (1 / v.t) - 1) : undefined),
        },
      },
    ],
    steps: {
      'A = P × (1 + r)^t': {
        A: { expr: '{P} × (1 + {r})^{t}', how: 'Multiply by 1 + r once for each year.' },
        P: { expr: '{A} ÷ (1 + {r})^{t}', how: 'Divide the amount by the growth factor.' },
        t: {
          expr: 'ln({A} ÷ {P}) ÷ ln(1 + {r})',
          how: 'Divide by P, take ln of both sides, then divide by ln(1 + r).',
        },
        r: {
          expr: '({A} ÷ {P})^(1 ÷ {t}) − 1',
          how: 'Divide by P, take the tth root, then take away 1.',
        },
      },
    },
    example: { A: 2737.13810081, P: 2000, r: 0.04, t: 8 },
    startWith: ['P', 'r', 't'],
    equation: '{A} = {P}(1 + {r})^{t}',
    representation: {
      kind: 'plot',
      x: { var: 't', min: 0, max: 20, label: 't (years)' },
      y: { var: 'A', min: 0, max: 5000, label: 'A' },
      params: ['P', 'r'],
      autoRange: true,
    },
  },
  {
    id: 'g.m11-complex-numbers-square',
    title: 'Squaring a complex number',
    use: 'Use this for “Write (3 + 2i)² in the form a + bi.”',
    assumptions: ['i² = −1.', '(a + bi)² = a² + 2abi + b²i² = (a² − b²) + 2abi.'],
    variables: [
      value('a', 'Real part', -100, 100),
      value('b', 'Imaginary part', -100, 100),
      value('p', 'Real part of the square', -10000, 10000),
      value('q', 'Imaginary part of the square', -20000, 20000),
    ],
    relations: [
      {
        id: 'p = a² − b²',
        display: '{p} = {a}^2 − {b}^2',
        vars: ['p', 'a', 'b'],
        residual: (v: Values) => v.p! - (v.a! ** 2 - v.b! ** 2),
        solve: {
          p: (v: Values) => exact(v.a! ** 2 - v.b! ** 2),
          a: (v: Values) => {
            const s = v.p! + v.b! ** 2;
            return s < 0 ? undefined : [exact(Math.sqrt(s)), exact(-Math.sqrt(s))];
          },
          b: (v: Values) => {
            const s = v.a! ** 2 - v.p!;
            return s < 0 ? undefined : [exact(Math.sqrt(s)), exact(-Math.sqrt(s))];
          },
        },
      },
      {
        id: 'q = 2ab',
        display: '{q} = 2 × {a} × {b}',
        vars: ['q', 'a', 'b'],
        residual: (v: Values) => v.q! - 2 * v.a! * v.b!,
        solve: {
          q: (v: Values) => exact(2 * v.a! * v.b!),
          a: (v: Values) => div(v.q!, 2 * v.b!),
          b: (v: Values) => div(v.q!, 2 * v.a!),
        },
      },
    ],
    steps: {
      'p = a² − b²': {
        p: { expr: '{a}^2 − {b}^2', how: 'The real part: a² plus b²i², and i² = −1.' },
        a: { expr: '±√({p} + {b}^2)', how: 'Add b² to the real part, then take the square root.' },
        b: { expr: '±√({a}^2 − {p})', how: 'Take the real part from a², then the square root.' },
      },
      'q = 2ab': {
        q: { expr: '2 × {a} × {b}', how: 'The imaginary part: the two middle terms, 2ab.' },
        a: { expr: '{q} ÷ (2 × {b})', how: 'Divide the imaginary part by 2b.' },
        b: { expr: '{q} ÷ (2 × {a})', how: 'Divide the imaginary part by 2a.' },
      },
    },
    example: { a: 3, b: 2, p: 5, q: 12 },
    startWith: ['a', 'b'],
    equation: '({a} + {b}i)^2 = {p} + {q}i',
    representation: {
      kind: 'coordinatePlane',
      x: 'a',
      y: 'b',
      second: { x: 'p', y: 'q' },
      segment: true,
      extent: 12,
      quadrants: 4,
    },
  },
  {
    id: 'g.m11-pythagorean-identities',
    title: 'sin² θ + cos² θ = 1',
    use: 'Use this for “sin θ = 3/5 and θ is acute. Find cos θ.”',
    assumptions: [
      'On the unit circle the point at angle θ is (cos θ, sin θ), 1 from the center.',
      'So (sin θ)² + (cos θ)² = 1 for every angle.',
      'The quadrant picks the sign of the square root.',
    ],
    variables: [value('s', 'sin θ', -1, 1), value('c', 'cos θ', -1, 1)],
    relations: [
      {
        id: 's² + c² = 1',
        display: '{s}^2 + {c}^2 = 1',
        vars: ['s', 'c'],
        residual: (v: Values) => v.s! ** 2 + v.c! ** 2 - 1,
        solve: {
          c: (v: Values) =>
            v.s! ** 2 > 1
              ? undefined
              : [exact(Math.sqrt(1 - v.s! ** 2)), exact(-Math.sqrt(1 - v.s! ** 2))],
          s: (v: Values) =>
            v.c! ** 2 > 1
              ? undefined
              : [exact(Math.sqrt(1 - v.c! ** 2)), exact(-Math.sqrt(1 - v.c! ** 2))],
        },
      },
    ],
    steps: {
      's² + c² = 1': {
        c: { expr: '±√(1 − {s}^2)', how: 'Take sin² θ from 1, then the square root.' },
        s: { expr: '±√(1 − {c}^2)', how: 'Take cos² θ from 1, then the square root.' },
      },
    },
    example: { s: 0.6, c: 0.8 },
    startWith: ['s'],
    equation: '({s})^2 + ({c})^2 = 1',
    representation: { kind: 'coordinatePlane', x: 'c', y: 's', extent: 1, quadrants: 4 },
  },
  {
    id: 'g.s10-nuclear-chemistry-half-life',
    title: 'Half-life: what is left',
    use: 'Use this for “Iodine-131 has a half-life of 8 days. How much of 80 g is left after 24 days?”',
    assumptions: [
      'In each half-life, half of the atoms still there decay.',
      'After t days, t ÷ T half-lives have passed.',
    ],
    variables: [
      value('N', 'Left (g)', 0, 1e6),
      value('N0', 'Start (g)', 0.000001, 1e6),
      value('t', 'Time (days)', 0, 1000),
      value('T', 'Half-life (days)', 1, 100000),
    ],
    relations: [
      {
        id: 'N = N₀ × (1/2)^(t ÷ T)',
        display: '{N} = {N0} × 0.5^({t} ÷ {T})',
        vars: ['N', 'N0', 't', 'T'],
        residual: (v: Values) => v.N! - v.N0! * 0.5 ** (v.t! / v.T!),
        solve: {
          N: (v: Values) => exact(v.N0! * 0.5 ** (v.t! / v.T!)),
          N0: (v: Values) => exact(v.N! / 0.5 ** (v.t! / v.T!)),
          t: (v: Values) => exact((v.T! * Math.log(v.N! / v.N0!)) / Math.log(0.5)),
          T: (v: Values) =>
            v.N === v.N0 ? undefined : exact((v.t! * Math.log(0.5)) / Math.log(v.N! / v.N0!)),
        },
      },
    ],
    steps: {
      'N = N₀ × (1/2)^(t ÷ T)': {
        N: { expr: '{N0} × 0.5^({t} ÷ {T})', how: 'Halve the start once for each half-life.' },
        N0: { expr: '{N} ÷ 0.5^({t} ÷ {T})', how: 'Double what is left once for each half-life.' },
        t: {
          expr: '{T} × ln({N} ÷ {N0}) ÷ ln(0.5)',
          how: 'Count the half-lives with logs, then multiply by the half-life.',
        },
        T: {
          expr: '{t} × ln(0.5) ÷ ln({N} ÷ {N0})',
          how: 'Count the half-lives with logs, then divide the time by that count.',
        },
      },
    },
    example: { N: 10, N0: 80, t: 24, T: 8 },
    startWith: ['N0', 't', 'T'],
    equation: '{N} = {N0}(1/2)^{{t}/{T}}',
    representation: {
      kind: 'plot',
      x: { var: 't', min: 0, max: 40, label: 't (days)' },
      y: { var: 'N', min: 0, max: 100, label: 'Left (g)' },
      params: ['N0', 'T'],
      autoRange: true,
    },
  },
  fromPage(
    'm.8.exponent-rules~power-of-power',
    'g.m8-exponent-rules-power-of-power',
    'A power of a power, as its equation',
    { equation: '({b}^{m})^{n} = {b}^{k} = {P}' },
  ),
];

/** The largest perfect square dividing a whole number n (36 for 72). */
const largestSquare = (n: number) => {
  let best = 1;
  for (let k = 1; k * k <= n; k++) if (n % (k * k) === 0) best = k * k;
  return best;
};

// H83: radicals, the bar over the box or the group; cube roots.
const H83: ModuleDef[] = [
  {
    id: 'g.m9-radicals-simplify',
    title: 'Simplify a square root',
    use: 'Use this for “Simplify √72.”',
    assumptions: [
      '√(a × b) = √a × √b for numbers that are not negative.',
      'Take out the largest perfect square that divides the number: √72 = √36 × √2 = 6√2.',
      'What is left under the root has no square factor but 1.',
    ],
    variables: [
      { ...value('n', 'Number under the root', 1, 1000), integer: true },
      { ...value('k', 'Number in front', 1, 40), integer: true, derived: true },
      { ...value('r', 'Number left under the root', 1, 1000), integer: true, derived: true },
      { ...value('q', 'Largest square factor', 1, 1000), integer: true, derived: true },
    ],
    relations: [
      {
        id: 'q = largest square factor of n',
        display: '{q} = largest square factor of {n}',
        vars: ['q', 'n'],
        residual: (v: Values) => v.q! - largestSquare(v.n!),
        solve: { q: (v: Values) => largestSquare(v.n!), n: () => undefined },
      },
      {
        id: 'k = √q',
        display: '{k} = √{q}',
        vars: ['k', 'q'],
        residual: (v: Values) => v.k! ** 2 - v.q!,
        solve: { k: (v: Values) => Math.sqrt(v.q!), q: (v: Values) => v.k! ** 2 },
      },
      {
        id: 'n = q × r',
        display: '{n} = {q} × {r}',
        vars: ['n', 'q', 'r'],
        residual: (v: Values) => v.n! - v.q! * v.r!,
        solve: {
          n: (v: Values) => v.q! * v.r!,
          r: (v: Values) => div(v.n!, v.q!),
          q: (v: Values) => div(v.n!, v.r!),
        },
      },
    ],
    steps: {
      'q = largest square factor of n': {
        q: {
          expr: 'largest square factor of {n}',
          how: 'Find the largest perfect square that divides the number.',
        },
      },
      'k = √q': {
        k: { expr: '√{q}', how: 'Its square root comes out in front of the root.' },
        q: { expr: '{k}^2', how: 'The number in front came out of its square.' },
      },
      'n = q × r': {
        r: { expr: '{n} ÷ {q}', how: 'What is left under the root: divide by that square.' },
        n: { expr: '{q} × {r}', how: 'Put the square back under the root: multiply.' },
        q: { expr: '{n} ÷ {r}', how: 'Divide by what is left under the root.' },
      },
    },
    example: { n: 72, k: 6, r: 2, q: 36 },
    startWith: ['n'],
    equation: '√{n} = {k}√{r}',
    representation: { kind: 'factorTree', value: 'n' },
  },
  {
    id: 'g.m11-radical-functions-equation',
    title: 'Solve a radical equation',
    use: 'Use this for “Solve √(2x + 3) = 5.”',
    assumptions: [
      'Square both sides to undo the square root: 2x + 3 = 25.',
      'A square root is never negative, so the right side must be 0 or more.',
      'Check the answer in the first equation: squaring can add a false one.',
    ],
    variables: [
      value('a', 'a', -100, 100),
      value('b', 'b', -1000, 1000),
      value('c', 'c', 0, 1000),
      { ...value('x', 'x', -1e6, 1e6), derived: true },
    ],
    relations: [
      {
        id: 'a × x + b = c²',
        display: '{a} × {x} + {b} = {c}^2',
        vars: ['a', 'x', 'b', 'c'],
        residual: (v: Values) => v.a! * v.x! + v.b! - v.c! ** 2,
        solve: {
          x: (v: Values) => (v.a ? exact((v.c! ** 2 - v.b!) / v.a) : undefined),
          b: (v: Values) => exact(v.c! ** 2 - v.a! * v.x!),
          a: (v: Values) => (v.x ? exact((v.c! ** 2 - v.b!) / v.x) : undefined),
          c: (v: Values) => {
            const s = v.a! * v.x! + v.b!;
            return s < 0 ? undefined : exact(Math.sqrt(s));
          },
        },
      },
    ],
    steps: {
      'a × x + b = c²': {
        x: {
          expr: '({c}^2 − {b}) ÷ {a}',
          how: 'Square both sides, take b from both sides, then divide by a.',
        },
        b: { expr: '{c}^2 − {a} × {x}', how: 'Square both sides, then take ax away.' },
        a: { expr: '({c}^2 − {b}) ÷ {x}', how: 'Square both sides, take b away, divide by x.' },
        c: { expr: '√({a} × {x} + {b})', how: 'Put x in and take the square root.' },
      },
    },
    example: { a: 2, b: 3, c: 5, x: 11 },
    startWith: ['a', 'b', 'c'],
    equation: '√({a}x + {b}) = {c}',
    representation: {
      kind: 'plot',
      x: { var: 'x', min: -2, max: 20, label: 'x' },
      y: { var: 'c', min: 0, max: 8, label: 'y' },
      params: ['a', 'b'],
      autoRange: true,
    },
  },
  {
    id: 'g.m12-confidence-intervals-margin',
    title: 'Margin of error',
    use: 'Use this for “A sample of 100 has standard deviation 15. Find the 95% margin of error (z = 1.96).”',
    assumptions: [
      'The margin of error is z standard errors; a standard error is σ/√n.',
      'Four times the sample size halves the margin.',
    ],
    variables: [
      value('E', 'Margin of error', 0.000001, 1e6),
      value('z', 'z for the confidence level', 0.1, 4),
      value('s', 'Standard deviation σ', 0.0001, 1e6),
      { ...value('n', 'Sample size', 1, 1e6), integer: true },
    ],
    relations: [
      {
        id: 'E = z × σ ÷ √n',
        display: '{E} = {z} × {s} ÷ √{n}',
        vars: ['E', 'z', 's', 'n'],
        residual: (v: Values) => v.E! - (v.z! * v.s!) / Math.sqrt(v.n!),
        solve: {
          E: (v: Values) => exact((v.z! * v.s!) / Math.sqrt(v.n!)),
          z: (v: Values) => exact((v.E! * Math.sqrt(v.n!)) / v.s!),
          s: (v: Values) => exact((v.E! * Math.sqrt(v.n!)) / v.z!),
          n: (v: Values) => exact(((v.z! * v.s!) / v.E!) ** 2),
        },
      },
    ],
    steps: {
      'E = z × σ ÷ √n': {
        E: { expr: '{z} × {s} ÷ √{n}', how: 'Divide σ by √n for the standard error; times z.' },
        z: { expr: '{E} × √{n} ÷ {s}', how: 'Divide the margin by the standard error.' },
        s: { expr: '{E} × √{n} ÷ {z}', how: 'Multiply the margin by √n, then divide by z.' },
        n: { expr: '({z} × {s} ÷ {E})^2', how: 'Solve for √n, then square it.' },
      },
    },
    example: { E: 2.94, z: 1.96, s: 15, n: 100 },
    startWith: ['z', 's', 'n'],
    equation: '{E} = {z} × {s}/√{n}',
    representation: {
      kind: 'table',
      sweep: 'n',
      output: 'E',
      params: ['z', 's'],
      rows: [25, 100, 400, 1600],
    },
  },
  {
    id: 'g.m10-special-right-triangles-45',
    title: '45°-45°-90° triangle',
    use: 'Use this for “A 45°-45°-90° triangle has legs of 7. How long is the hypotenuse?”',
    assumptions: [
      'The two legs are equal, so c² = s² + s² = 2s².',
      'So the hypotenuse is √2 times a leg: c = s√2.',
    ],
    variables: [value('s', 'Leg', 0.01, 1000), value('c', 'Hypotenuse', 0.01, 1500)],
    relations: [
      {
        id: 'c = s × √2',
        display: '{c} = {s} × √2',
        vars: ['c', 's'],
        residual: (v: Values) => v.c! - v.s! * Math.SQRT2,
        solve: {
          c: (v: Values) => exact(v.s! * Math.SQRT2),
          s: (v: Values) => exact(v.c! / Math.SQRT2),
        },
      },
    ],
    steps: {
      'c = s × √2': {
        c: { expr: '{s} × √2', how: 'The hypotenuse is √2 times a leg.' },
        s: { expr: '{c} ÷ √2', how: 'Divide the hypotenuse by √2.' },
      },
    },
    example: { s: 7, c: 9.89949493661 },
    startWith: ['s'],
    equation: '{c} = {s}√2',
    representation: { kind: 'rightTriangle', a: 's', b: 's', c: 'c', extent: 12 },
  },
  {
    id: 'g.m9-radicals-cube-root',
    title: 'Cube root',
    use: 'Use this for “Find ∛343.”',
    assumptions: [
      'The cube root of n is the number that, used as a factor three times, makes n.',
      'Cubing undoes it: 7 × 7 × 7 = 343.',
    ],
    variables: [value('n', 'Number', 0, 8000), value('k', 'Cube root', 0, 20)],
    relations: [
      {
        id: 'k = ∛n',
        display: '{k} = ∛{n}',
        vars: ['k', 'n'],
        residual: (v: Values) => v.k! ** 3 - v.n!,
        solve: { k: (v: Values) => exact(Math.cbrt(v.n!)), n: (v: Values) => exact(v.k! ** 3) },
      },
    ],
    steps: {
      'k = ∛n': {
        k: { expr: '∛{n}', how: 'Find the number that, used three times as a factor, makes n.' },
        n: { expr: '{k}^3', how: 'Use the root as a factor three times.' },
      },
    },
    example: { n: 343, k: 7 },
    startWith: ['n'],
    equation: '∛{n} = {k}',
    representation: { kind: 'rootSquare', area: 'n', side: 'k', solid: 'cube' },
  },
];

/** The sign a value codes (1 <, 2 ≤, 3 >, 4 ≥, 5 =), flipped by dividing by a negative. */
const SIGNS = ['<', '≤', '>', '≥', '='] as const;
const flip = (s: number) => ({ 1: 3, 2: 4, 3: 1, 4: 2 })[s] ?? s;

// H84: a sign or operator box, tapped through its signs, tied to the page's coded value.
const H84: ModuleDef[] = [
  (() => {
    const page = fromPage(
      'm.7.two-step-equations~inequality',
      'g.m7-two-step-equations-inequality',
      'Two-step inequality, the sign in the equation',
      { equation: '{p}x + {q} {s:sign} {r}' },
    );
    // The page's work lines write the sign; with no sign chosen yet they wait for it (the page
    // itself prints "undefined" there: reported to the lesson chat).
    const rel = page.steps['b = (r − q) ÷ p']!;
    const work = rel.b!.work as (v: Values) => string[];
    return {
      ...page,
      steps: {
        ...page.steps,
        'b = (r − q) ÷ p': {
          ...rel,
          b: { ...rel.b!, work: (v: Values) => (v.s === undefined ? [] : work(v)) },
        },
      },
    };
  })(),
  {
    id: 'g.m9-linear-inequalities-both-sides',
    title: 'Inequality with x on both sides',
    use: 'Use this for “Solve 5x − 4 ≥ 2x + 11.”',
    assumptions: [
      'Gather the x terms on one side and the numbers on the other, as in an equation.',
      'Dividing both sides by a negative number flips the sign.',
    ],
    variables: [
      value('a', 'x on the left', -100, 100),
      value('b', 'Number on the left', -10000, 10000),
      { ...value('s', 'Sign (1 <, 2 ≤, 3 >, 4 ≥)', 1, 4), integer: true },
      value('c', 'x on the right', -100, 100),
      value('d', 'Number on the right', -10000, 10000),
      { ...value('x', 'Bound', -1e6, 1e6), derived: true },
      {
        ...value('f', 'Sign of the answer (1 <, 2 ≤, 3 >, 4 ≥)', 1, 4),
        integer: true,
        derived: true,
      },
    ],
    relations: [
      {
        id: 'x = (d − b) ÷ (a − c)',
        display: '{x} = ({d} − {b}) ÷ ({a} − {c})',
        vars: ['x', 'd', 'b', 'a', 'c'],
        residual: (v: Values) => v.x! * (v.a! - v.c!) - (v.d! - v.b!),
        solve: {
          x: (v: Values) => (v.a === v.c ? undefined : exact((v.d! - v.b!) / (v.a! - v.c!))),
          d: (v: Values) => exact(v.x! * (v.a! - v.c!) + v.b!),
          b: (v: Values) => exact(v.d! - v.x! * (v.a! - v.c!)),
          a: () => undefined,
          c: () => undefined,
        },
      },
      {
        id: 'f = s, flipped when a − c < 0',
        display: 'sign {f} from sign {s}, flipped when {a} − {c} is negative',
        vars: ['f', 's', 'a', 'c'],
        check: (v: Values) => `${v.a! - v.c! < 0 ? flip(v.s!) : v.s!} = ${v.f}`,
        residual: (v: Values) => v.f! - (v.a! - v.c! < 0 ? flip(v.s!) : v.s!),
        solve: {
          f: (v: Values) => (v.a! - v.c! < 0 ? flip(v.s!) : v.s!),
          s: (v: Values) => (v.a! - v.c! < 0 ? flip(v.f!) : v.f!),
          a: () => undefined,
          c: () => undefined,
        },
      },
    ],
    steps: {
      'x = (d − b) ÷ (a − c)': {
        x: {
          expr: '({d} − {b}) ÷ ({a} − {c})',
          how: 'Take cx and b from both sides, then divide by a − c.',
        },
        d: { expr: '{x} × ({a} − {c}) + {b}', how: 'Undo the steps: multiply, then add b.' },
        b: { expr: '{d} − {x} × ({a} − {c})', how: 'Take the x part from the right side.' },
      },
      'f = s, flipped when a − c < 0': {
        f: {
          expr: (v: Values) => `${v.a! - v.c! < 0 ? flip(v.s!) : v.s!}`,
          how: (v: Values) =>
            v.a! - v.c! < 0
              ? `a − c is negative: dividing by it flips ${SIGNS[v.s! - 1]} to ${SIGNS[flip(v.s!) - 1]}.`
              : `a − c is positive: the sign stays ${SIGNS[v.s! - 1]}.`,
        },
        s: {
          expr: (v: Values) => `${v.a! - v.c! < 0 ? flip(v.f!) : v.f!}`,
          how: 'Undo the flip when a − c is negative.',
        },
      },
    },
    example: { a: 5, b: -4, s: 4, c: 2, d: 11, x: 5, f: 4 },
    startWith: ['a', 'b', 's', 'c', 'd'],
    equation: '{a}x + {b} {s:sign} {c}x + {d}',
    representation: { kind: 'integerLine', value: 'x', min: -8, max: 8, inequality: { sign: 'f' } },
  },
  {
    id: 'g.m7-rational-operations-add-subtract',
    title: 'Add or subtract signed numbers',
    use: 'Use this for “−7 − (−3)” or “−7 + 3”: tap the sign to switch.',
    assumptions: [
      'Adding a positive number moves right on the number line; a negative one moves left.',
      'Subtracting a number is adding its opposite.',
    ],
    variables: [
      value('a', 'First number', -1000, 1000),
      { ...value('o', 'Operation (1 +, 2 −)', 1, 2), integer: true },
      value('b', 'Second number', -3000, 3000),
      value('r', 'Result', -4000, 4000),
    ],
    relations: [
      {
        id: 'r = a + b or a − b',
        display: '{r} = {a} plus or minus {b}, as the sign {o} says',
        vars: ['r', 'a', 'b', 'o'],
        check: (v: Values) => `${fmt(v.a!)} ${v.o === 2 ? '−' : '+'} ${paren(v.b!)} = ${fmt(v.r!)}`,
        residual: (v: Values) => v.r! - (v.o === 2 ? v.a! - v.b! : v.a! + v.b!),
        solve: {
          r: (v: Values) => exact(v.o === 2 ? v.a! - v.b! : v.a! + v.b!),
          a: (v: Values) => exact(v.o === 2 ? v.r! + v.b! : v.r! - v.b!),
          b: (v: Values) => exact(v.o === 2 ? v.a! - v.r! : v.r! - v.a!),
          // The nearer of the two signs (the relation then checks it): + when r = a + b.
          o: (v: Values) =>
            Math.abs(v.r! - (v.a! + v.b!)) <= Math.abs(v.r! - (v.a! - v.b!)) ? 1 : 2,
        },
      },
    ],
    steps: {
      'r = a + b or a − b': {
        r: {
          expr: (v: Values) => (v.o === 2 ? '{a} − ({b})' : '{a} + ({b})'),
          how: (v: Values) =>
            v.o === 2
              ? 'Subtracting is adding the opposite: jump the other way.'
              : 'Start at the first number and jump by the second.',
        },
        a: {
          expr: (v: Values) => (v.o === 2 ? '{r} + ({b})' : '{r} − ({b})'),
          how: 'Undo the jump from the result.',
        },
        b: {
          expr: (v: Values) => (v.o === 2 ? '{a} − ({r})' : '{r} − ({a})'),
          how: 'The jump from the first number to the result.',
        },
        o: {
          expr: (v: Values) => (Math.abs(v.r! - (v.a! + v.b!)) < 1e-9 ? '1' : '2'),
          how: 'The sign that makes it true: 1 is +, 2 is −.',
        },
      },
    },
    example: { a: -7, o: 2, b: -3, r: -4 },
    startWith: ['a', 'o', 'b'],
    equation: '{a} {o:op} {b} = {r}',
    representation: { kind: 'integerLine', value: 'a', second: 'r', min: -10, max: 10 },
  },
  {
    id: 'g.m6-integers-compare',
    title: 'Compare two numbers: the sign worked out',
    use: 'Use this for “Write <, > or = between −3.5 and −2.”',
    assumptions: [
      'On a number line the number to the right is greater.',
      'Of two negative numbers, the one closer to 0 is greater.',
    ],
    variables: [
      value('a', 'First number', -1000, 1000),
      { ...value('c', 'Sign (1 <, 3 >, 5 =)', 1, 5), integer: true, derived: true },
      value('b', 'Second number', -1000, 1000),
    ],
    relations: [
      {
        id: 'c = sign between a and b',
        display: 'sign {c} between {a} and {b}',
        vars: ['c', 'a', 'b'],
        check: (v: Values) => `${v.a! < v.b! ? 1 : v.a! > v.b! ? 3 : 5} = ${v.c}`,
        residual: (v: Values) => v.c! - (v.a! < v.b! ? 1 : v.a! > v.b! ? 3 : 5),
        solve: {
          c: (v: Values) => (v.a! < v.b! ? 1 : v.a! > v.b! ? 3 : 5),
          a: () => undefined,
          b: () => undefined,
        },
      },
    ],
    steps: {
      'c = sign between a and b': {
        c: {
          expr: (v: Values) => `${v.a! < v.b! ? 1 : v.a! > v.b! ? 3 : 5}`,
          how: (v: Values) =>
            v.a! < v.b!
              ? 'The first is left of the second on the line: <.'
              : v.a! > v.b!
                ? 'The first is right of the second on the line: >.'
                : 'They are the same point: =.',
        },
      },
    },
    example: { a: -3.5, c: 1, b: -2 },
    startWith: ['a', 'b'],
    equation: '{a} {c:relation} {b}',
    representation: { kind: 'integerLine', value: 'a', second: 'b', min: -5, max: 5 },
  },
];

export const HSM_GALLERY_MODULES: ModuleDef[] = [...H81, ...H82, ...H83, ...H84];
export const HSM_GALLERY_LAYOUTS: LayoutDef[] = [];
