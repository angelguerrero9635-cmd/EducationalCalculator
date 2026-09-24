/**
 * K–12 pilot modules. Keyed by taxonomy skill id; the skill itself (title, grade, strand)
 * still comes from taxonomy.ts. Written and reviewed against docs/MODULE_GUIDE.md.
 */
import type { ModuleDef } from './types';

const div = (a: number, b: number) => (b === 0 ? undefined : a / b);
const whole = (id: string, symbol: string, name: string, max: number) => ({
  id,
  symbol,
  name,
  min: 0,
  max,
  step: 1,
  integer: true,
});

export const K12_MODULES: ModuleDef[] = [
  {
    id: 'm.K.add-sub-10',
    assumptions: [
      'We count whole things, from 0 to 10.',
      'Adding puts two groups together.',
      'Taking away leaves fewer than before.',
    ],
    variables: [
      whole('a', 'a', 'First group', 10),
      whole('b', 'b', 'Second group', 10),
      whole('c', 'c', 'Total', 10),
    ],
    relations: [
      {
        id: 'a + b = c',
        display: '{a} + {b} = {c}',
        vars: ['a', 'b', 'c'],
        residual: (v) => v.a! + v.b! - v.c!,
        solve: { c: (v) => v.a! + v.b!, a: (v) => v.c! - v.b!, b: (v) => v.c! - v.a! },
      },
      {
        id: 'c − b = a',
        display: '{c} − {b} = {a}',
        vars: ['a', 'b', 'c'],
        residual: (v) => v.c! - v.b! - v.a!,
        solve: { a: (v) => v.c! - v.b!, c: (v) => v.a! + v.b!, b: (v) => v.c! - v.a! },
      },
    ],
    steps: {
      'a + b = c': {
        c: { expr: '{a} + {b}', how: 'Put the two groups together and count them all.' },
        a: { expr: '{c} − {b}', how: 'Take the second group away from the total.' },
        b: { expr: '{c} − {a}', how: 'Take the first group away from the total.' },
      },
      'c − b = a': {
        a: { expr: '{c} − {b}', how: 'Take b away from the total. Count what is left.' },
        c: { expr: '{a} + {b}', how: 'Put back the group that was taken away.' },
        b: { expr: '{c} − {a}', how: 'The group taken away is the total minus what is left.' },
      },
    },
    example: { a: 3, b: 4, c: 7 },
    startWith: ['a', 'b'],
    representation: { kind: 'tenFrame', first: 'a', second: 'b', total: 'c' },
  },

  {
    id: 'm.K.classify-count',
    assumptions: [
      'Every object goes into exactly one group.',
      'Each object is counted once.',
      'The total is all the groups added together.',
    ],
    variables: [
      whole('c', 'c', 'Circles', 10),
      whole('s', 's', 'Squares', 10),
      whole('t', 't', 'Triangles', 10),
      whole('n', 'n', 'Total', 30),
    ],
    relations: [
      {
        id: 'n = c + s + t',
        display: '{n} = {c} + {s} + {t}',
        vars: ['n', 'c', 's', 't'],
        residual: (v) => v.n! - v.c! - v.s! - v.t!,
        solve: {
          n: (v) => v.c! + v.s! + v.t!,
          c: (v) => v.n! - v.s! - v.t!,
          s: (v) => v.n! - v.c! - v.t!,
          t: (v) => v.n! - v.c! - v.s!,
        },
      },
    ],
    steps: {
      'n = c + s + t': {
        n: { expr: '{c} + {s} + {t}', how: 'Count every group, then add them together.' },
        c: {
          expr: '{n} − {s} − {t}',
          how: 'Take the other groups away from the total. Count what is left.',
        },
        s: {
          expr: '{n} − {c} − {t}',
          how: 'Take the other groups away from the total. Count what is left.',
        },
        t: {
          expr: '{n} − {c} − {s}',
          how: 'Take the other groups away from the total. Count what is left.',
        },
      },
    },
    example: { c: 4, s: 3, t: 5, n: 12 },
    startWith: ['c', 's', 't'],
    representation: {
      kind: 'pictureGraph',
      columns: [
        { var: 'c', icon: 'circle' },
        { var: 's', icon: 'square' },
        { var: 't', icon: 'triangle' },
      ],
      max: 10,
      total: 'n',
    },
  },

  {
    id: 'm.3.area',
    assumptions: [
      'The shape is a rectangle: four right angles, and opposite sides are equal.',
      'Length and width use the same unit, so area is in square units.',
      'Area counts the unit squares that cover the inside with no gaps or overlaps.',
    ],
    variables: [
      { id: 'l', symbol: 'l', name: 'Length', unit: 'cm', min: 0, max: 10, step: 1, integer: true },
      { id: 'w', symbol: 'w', name: 'Width', unit: 'cm', min: 0, max: 10, step: 1, integer: true },
      { id: 'A', symbol: 'A', name: 'Area', unit: 'cm²', min: 0, max: 100, integer: true },
    ],
    relations: [
      {
        id: 'A = l × w',
        display: '{A} = {l} × {w}',
        vars: ['A', 'l', 'w'],
        residual: (v) => v.A! - v.l! * v.w!,
        solve: { A: (v) => v.l! * v.w!, l: (v) => div(v.A!, v.w!), w: (v) => div(v.A!, v.l!) },
      },
    ],
    steps: {
      'A = l × w': {
        A: { expr: '{l} × {w}', how: 'There are w rows of l squares, so count l × w squares.' },
        l: {
          expr: '{A} ÷ {w}',
          how: 'There are w rows. Share the squares equally among the rows.',
        },
        w: { expr: '{A} ÷ {l}', how: 'Each row has l squares. Divide to find how many rows.' },
      },
    },
    example: { l: 4, w: 3, A: 12 },
    startWith: ['l', 'w'],
    representation: { kind: 'rectangle', length: 'l', width: 'w', inside: 'A', extent: 10 },
  },

  {
    id: 'm.6.percent',
    assumptions: [
      'Percent means “out of 100”, and the whole is 100%.',
      'The part and the whole are measured in the same unit.',
      'In this lesson the part is never bigger than the whole (0% to 100%).',
    ],
    variables: [
      { id: 'p', symbol: 'p', name: 'Percent', unit: '%', min: 0, max: 100, step: 1 },
      { id: 'w', symbol: 'W', name: 'Whole', min: 0, max: 100000 },
      { id: 'x', symbol: 'P', name: 'Part', min: 0, max: 100000 },
    ],
    relations: [
      {
        id: 'Part = p% of Whole',
        display: '{x} = {p} ÷ 100 × {w}',
        vars: ['x', 'p', 'w'],
        residual: (v) => v.x! - (v.p! / 100) * v.w!,
        solve: {
          x: (v) => (v.p! / 100) * v.w!,
          w: (v) => div(100 * v.x!, v.p!),
          p: (v) => div(100 * v.x!, v.w!),
        },
      },
    ],
    steps: {
      'Part = p% of Whole': {
        x: {
          expr: '{p} ÷ 100 × {w}',
          how: 'p% means p out of 100, so take p hundredths of the whole.',
        },
        w: {
          expr: '100 × {x} ÷ {p}',
          how: 'Multiply both sides by 100, then divide by the percent.',
        },
        p: {
          expr: '100 × {x} ÷ {w}',
          how: 'Divide the part by the whole, then multiply by 100 to get “out of 100”.',
        },
      },
    },
    example: { p: 25, w: 80, x: 20 },
    startWith: ['p', 'w'],
    representation: { kind: 'grid100', percent: 'p', caption: { part: 'x', whole: 'w' } },
  },

  {
    id: 'm.7.circles',
    assumptions: [
      'Every point on the circle is the same distance (the radius) from the center.',
      'π ≈ 3.14159 is the ratio of any circle’s circumference to its diameter.',
      'All lengths use the same unit; area is in square units.',
    ],
    variables: [
      { id: 'r', symbol: 'r', name: 'Radius', unit: 'cm', min: 0, max: 1000, step: 0.5 },
      { id: 'd', symbol: 'd', name: 'Diameter', unit: 'cm', min: 0, max: 2000 },
      { id: 'C', symbol: 'C', name: 'Circumference', unit: 'cm', min: 0, max: 6300 },
      { id: 'A', symbol: 'A', name: 'Area', unit: 'cm²', min: 0, max: 3200000 },
    ],
    relations: [
      {
        id: 'd = 2r',
        display: '{d} = 2 × {r}',
        vars: ['d', 'r'],
        residual: (v) => v.d! - 2 * v.r!,
        solve: { d: (v) => 2 * v.r!, r: (v) => v.d! / 2 },
      },
      {
        id: 'C = πd',
        display: '{C} = π × {d}',
        vars: ['C', 'd'],
        residual: (v) => v.C! - Math.PI * v.d!,
        solve: { C: (v) => Math.PI * v.d!, d: (v) => v.C! / Math.PI },
      },
      {
        id: 'C = 2πr',
        display: '{C} = 2 × π × {r}',
        vars: ['C', 'r'],
        residual: (v) => v.C! - 2 * Math.PI * v.r!,
        solve: { C: (v) => 2 * Math.PI * v.r!, r: (v) => v.C! / (2 * Math.PI) },
      },
      {
        id: 'A = πr²',
        display: '{A} = π × {r}²',
        vars: ['A', 'r'],
        residual: (v) => v.A! - Math.PI * v.r! ** 2,
        solve: { A: (v) => Math.PI * v.r! ** 2, r: (v) => Math.sqrt(v.A! / Math.PI) },
      },
    ],
    steps: {
      'd = 2r': {
        d: { expr: '2 × {r}', how: 'A diameter is two radii end to end through the center.' },
        r: { expr: '{d} ÷ 2', how: 'The radius is half the diameter.' },
      },
      'C = πd': {
        C: { expr: 'π × {d}', how: 'Circumference is π times the diameter.' },
        d: { expr: '{C} ÷ π', how: 'Divide both sides by π.' },
      },
      'C = 2πr': {
        C: {
          expr: '2 × π × {r}',
          how: 'The diameter is 2r, and circumference is π times the diameter.',
        },
        r: { expr: '{C} ÷ (2 × π)', how: 'Divide both sides by 2π.' },
      },
      'A = πr²': {
        A: { expr: 'π × {r}²', how: 'Square the radius, then multiply by π.' },
        r: {
          expr: '√({A} ÷ π)',
          how: 'Divide both sides by π, then take the square root (a radius is never negative).',
        },
      },
    },
    example: { r: 3, d: 6, C: 6 * Math.PI, A: 9 * Math.PI },
    startWith: ['r'],
    representation: {
      kind: 'circle',
      radius: 'r',
      extent: 5,
      diameter: 'd',
      circumference: 'C',
      area: 'A',
    },
  },

  {
    id: 'm.8.pythagorean',
    assumptions: [
      'The triangle has one right angle (90°).',
      'a and b are the legs, which form the right angle; c is the hypotenuse, the longest side.',
      'Distance between two points: the horizontal and vertical differences are the legs a and b.',
      'All three sides use the same unit.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'Leg a', unit: 'cm', min: 0, max: 100, step: 0.5 },
      { id: 'b', symbol: 'b', name: 'Leg b', unit: 'cm', min: 0, max: 100, step: 0.5 },
      { id: 'c', symbol: 'c', name: 'Hypotenuse', unit: 'cm', min: 0, max: 142 },
    ],
    relations: [
      {
        id: 'a² + b² = c²',
        display: '{a}² + {b}² = {c}²',
        vars: ['a', 'b', 'c'],
        residual: (v) => v.a! ** 2 + v.b! ** 2 - v.c! ** 2,
        // √ of a negative is NaN on purpose: the solver reports it as a conflict
        // (a hypotenuse shorter than a leg) instead of silently leaving the leg blank.
        solve: {
          c: (v) => Math.sqrt(v.a! ** 2 + v.b! ** 2),
          a: (v) => Math.sqrt(v.c! ** 2 - v.b! ** 2),
          b: (v) => Math.sqrt(v.c! ** 2 - v.a! ** 2),
        },
      },
    ],
    steps: {
      'a² + b² = c²': {
        c: { expr: '√({a}² + {b}²)', how: 'Square each leg, add them, then take the square root.' },
        a: {
          expr: '√({c}² − {b}²)',
          how: 'Subtract b² from both sides, then take the square root.',
        },
        b: {
          expr: '√({c}² − {a}²)',
          how: 'Subtract a² from both sides, then take the square root.',
        },
      },
    },
    example: { a: 3, b: 4, c: 5 },
    startWith: ['a', 'b'],
    representation: { kind: 'rightTriangle', a: 'a', b: 'b', c: 'c', extent: 5 },
  },

  {
    id: 'm.8.linear-functions',
    assumptions: [
      'The graph is a straight line, so y changes at a constant rate.',
      'm is the slope: how much y changes when x increases by 1 (rise over run).',
      'b is the y-intercept: the value of y when x = 0.',
    ],
    variables: [
      { id: 'x', symbol: 'x', name: 'Input x', min: -10, max: 10, step: 0.5 },
      { id: 'y', symbol: 'y', name: 'Output y', min: -110, max: 110 },
      { id: 'm', symbol: 'm', name: 'Slope', min: -10, max: 10, step: 0.5 },
      { id: 'b', symbol: 'b', name: 'y-intercept', min: -10, max: 10, step: 0.5 },
    ],
    relations: [
      {
        id: 'y = mx + b',
        display: '{y} = {m} × {x} + {b}',
        vars: ['y', 'm', 'x', 'b'],
        residual: (v) => v.y! - (v.m! * v.x! + v.b!),
        solve: {
          y: (v) => v.m! * v.x! + v.b!,
          b: (v) => v.y! - v.m! * v.x!,
          m: (v) => div(v.y! - v.b!, v.x!),
          x: (v) => div(v.y! - v.b!, v.m!),
        },
      },
    ],
    steps: {
      'y = mx + b': {
        y: {
          expr: '{m} × {x} + {b}',
          how: 'Start at b, then add the slope once for every step of x.',
        },
        b: { expr: '{y} − {m} × {x}', how: 'Subtract m·x from both sides.' },
        m: { expr: '({y} − {b}) ÷ {x}', how: 'Subtract b from both sides, then divide by x.' },
        x: {
          expr: '({y} − {b}) ÷ {m}',
          how: 'Subtract b from both sides, then divide by the slope.',
        },
      },
    },
    example: { m: 2, b: 1, x: 3, y: 7 },
    startWith: ['x', 'm', 'b'],
    representation: {
      kind: 'plot',
      x: { var: 'x', min: -10, max: 10 },
      y: { var: 'y', min: -20, max: 20 },
      params: ['m', 'b'],
      slopeTriangle: 'm',
      intercept: 'b',
    },
  },

  {
    id: 'm.9.exponential-functions',
    assumptions: [
      'The amount changes by the same percent every time period (it compounds).',
      'A positive rate means growth; a negative rate means decay.',
      'All time periods are the same length.',
    ],
    variables: [
      { id: 'a', symbol: 'a', name: 'Starting amount', min: 0, max: 1000000 },
      { id: 'r', symbol: 'r', name: 'Rate per period', unit: '%', min: -100, max: 100, step: 1 },
      { id: 't', symbol: 't', name: 'Time periods', min: 0, max: 50, step: 1 },
      { id: 'y', symbol: 'y', name: 'Amount after t periods', min: 0, max: 1e12 },
    ],
    relations: [
      {
        id: 'y = a(1 + r/100)^t',
        display: '{y} = {a} × (1 + {r} ÷ 100)^{t}',
        vars: ['y', 'a', 'r', 't'],
        residual: (v) => v.y! - v.a! * (1 + v.r! / 100) ** v.t!,
        solve: {
          y: (v) => v.a! * (1 + v.r! / 100) ** v.t!,
          a: (v) => div(v.y!, (1 + v.r! / 100) ** v.t!),
          t: (v) => {
            const base = 1 + v.r! / 100;
            const ratio = v.y! / v.a!;
            if (!(base > 0) || base === 1 || !(ratio > 0)) return undefined;
            return Math.log(ratio) / Math.log(base);
          },
          r: (v) => {
            const ratio = v.y! / v.a!;
            if (v.t === 0 || !(ratio >= 0)) return undefined;
            return 100 * (ratio ** (1 / v.t!) - 1);
          },
        },
      },
    ],
    steps: {
      'y = a(1 + r/100)^t': {
        y: {
          expr: '{a} × (1 + {r} ÷ 100)^{t}',
          how: 'The growth factor is 1 + r/100. Multiply by it once per period, starting from a.',
        },
        a: {
          expr: '{y} ÷ (1 + {r} ÷ 100)^{t}',
          how: 'Divide both sides by the growth factor raised to t.',
        },
        t: {
          expr: 'ln({y} ÷ {a}) ÷ ln(1 + {r} ÷ 100)',
          how: 'Divide both sides by a. In Algebra 1, find t in the table where y is reached; with logarithms (Algebra 2), take the log of both sides to bring t down.',
        },
        r: {
          expr: '100 × (({y} ÷ {a})^(1 ÷ {t}) − 1)',
          how: 'Divide by a and take the t-th root to get the growth factor. Subtract 1 and write it as a percent.',
        },
      },
    },
    example: { a: 100, r: 10, t: 3, y: 133.1 },
    startWith: ['t', 'a', 'r'],
    representation: {
      kind: 'table',
      sweep: 't',
      output: 'y',
      params: ['a', 'r'],
      rows: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  },

  {
    id: 's.6.density',
    assumptions: [
      'The object is one uniform material, so its density is the same everywhere.',
      'Mass in grams and volume in cubic centimeters give density in g/cm³.',
      'Water is about 1 g/cm³: denser objects sink in water, less dense ones float.',
    ],
    variables: [
      { id: 'rho', symbol: 'ρ', name: 'Density', unit: 'g/cm³', min: 0.01, max: 25, step: 0.1 },
      { id: 'm', symbol: 'm', name: 'Mass', unit: 'g', min: 0, max: 2500000 },
      { id: 'V', symbol: 'V', name: 'Volume', unit: 'cm³', min: 0.001, max: 100000, step: 1 },
    ],
    relations: [
      {
        id: 'ρ = m ÷ V',
        display: '{rho} = {m} ÷ {V}',
        vars: ['rho', 'm', 'V'],
        residual: (v) => v.rho! * v.V! - v.m!,
        solve: {
          rho: (v) => div(v.m!, v.V!),
          m: (v) => v.rho! * v.V!,
          V: (v) => div(v.m!, v.rho!),
        },
      },
    ],
    steps: {
      'ρ = m ÷ V': {
        rho: {
          expr: '{m} ÷ {V}',
          how: 'Density is the mass in each unit of volume: share the mass equally over the volume.',
        },
        m: {
          expr: '{rho} × {V}',
          how: 'Each unit of volume holds ρ of mass, so multiply by the volume.',
        },
        V: { expr: '{m} ÷ {rho}', how: 'Multiply both sides by V, then divide by the density.' },
      },
    },
    example: { rho: 2.7, V: 20, m: 54 },
    startWith: ['rho', 'V'],
    // Middle-school science (NGSS) works in SI; US units stay reachable through Mixed.
    unitSystems: ['metric'],
    representation: {
      kind: 'plot',
      x: { var: 'V', min: 0, max: 100 },
      y: { var: 'm', min: 0, max: 300 },
      params: ['rho'],
      autoRange: true,
    },
  },

  {
    id: 's.8.newtons-laws',
    assumptions: [
      'F is the net force: all the forces on the object added together.',
      '1st law: no net force means no acceleration (a = 0). 3rd law: forces come in equal, opposite pairs.',
      'The mass stays the same, and the force and acceleration point the same way.',
      '1 N = 1 kg × 1 m/s².',
    ],
    variables: [
      { id: 'F', symbol: 'F', name: 'Net force', unit: 'N', min: 0, max: 100000, step: 1 },
      { id: 'm', symbol: 'm', name: 'Mass', unit: 'kg', min: 0.5, max: 5000, step: 0.5 },
      { id: 'a', symbol: 'a', name: 'Acceleration', unit: 'm/s²', min: 0, max: 1000, step: 0.5 },
    ],
    relations: [
      {
        id: 'F = m × a',
        display: '{F} = {m} × {a}',
        vars: ['F', 'm', 'a'],
        residual: (v) => v.F! - v.m! * v.a!,
        solve: {
          F: (v) => v.m! * v.a!,
          m: (v) => div(v.F!, v.a!),
          a: (v) => div(v.F!, v.m!),
        },
      },
    ],
    steps: {
      'F = m × a': {
        F: {
          expr: '{m} × {a}',
          how: 'A bigger mass or a bigger acceleration needs more force: multiply them.',
        },
        m: { expr: '{F} ÷ {a}', how: 'Divide both sides by the acceleration.' },
        a: {
          expr: '{F} ÷ {m}',
          how: 'Divide both sides by the mass: the same force speeds up a heavier object less.',
        },
      },
    },
    example: { m: 10, a: 2, F: 20 },
    startWith: ['a', 'm'],
    // Middle-school science (NGSS) works in SI; US units stay reachable through Mixed.
    unitSystems: ['metric'],
    representation: {
      kind: 'force',
      force: 'F',
      mass: 'm',
      acceleration: 'a',
      forceExtent: 50,
      accelerationExtent: 5,
    },
  },
];
