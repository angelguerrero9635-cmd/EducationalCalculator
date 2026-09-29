/**
 * Grades 9–12 gallery demos (group HM: the equation-input parts H81–H88; see
 * pictureRequestsHs.ts and docs/EQUATION_INPUTS.md). Each demo is a page stand-in whose equation
 * input uses the new part. Spread into gallery.ts.
 */
import type { Values } from '@/engine/types';

import { div } from './helpers';
import type { LayoutDef } from './layouts';
import { MATH_5_MODULES } from './math/5';
import { MATH_7_MODULES } from './math/7';
import { MATH_8_MODULES } from './math/8';
import { SCIENCE_7_MODULES } from './science/7';
import type { ModuleDef } from './types';

const exact = (x: number) => Number(x.toPrecision(12));

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

export const HSM_GALLERY_MODULES: ModuleDef[] = [...H81, ...H82];
export const HSM_GALLERY_LAYOUTS: LayoutDef[] = [];
