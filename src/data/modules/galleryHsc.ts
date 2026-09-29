/**
 * Grades 9–12 gallery demos (group HC; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation } from './types';

const RAD = Math.PI / 180;
const sin = (d: number) => Math.sin(d * RAD);
const cos = (d: number) => Math.cos(d * RAD);
const tan = (d: number) => Math.tan(d * RAD);
/** Inverse sine in degrees: both angles with that sine (the solver keeps the one that fits). */
const asinBoth = (x: number) => {
  if (!(x > 0 && x <= 1 + 1e-12)) return undefined;
  const d = Math.asin(Math.min(1, x)) / RAD;
  return Math.abs(d - 90) < 1e-9 ? d : [d, 180 - d];
};
const acosDeg = (x: number) =>
  Math.abs(x) <= 1 + 1e-12 ? Math.acos(Math.max(-1, Math.min(1, x))) / RAD : undefined;
const atanDeg = (x: number) => Math.atan(x) / RAD;
const root = (x: number) => (x >= 0 ? Math.sqrt(x) : undefined);

const side = (id: string, name: string, max = 100): VariableDef => ({
  id,
  symbol: id,
  name,
  min: 0.1,
  max,
  step: 0.1,
});
const angle = (id: string, name: string, symbol = id, max = 179): VariableDef => ({
  id,
  symbol,
  name,
  unit: '°',
  min: 1,
  max,
  step: 1,
});

// ─── Any triangle: the angle sum and the laws of cosines and sines ────────────

/** a² = b² + c² − 2bc cos A, for the side x opposite angle X between sides y and z. */
function cosines(x: string, y: string, z: string, X: string): Relation {
  return {
    id: `${x}² = ${y}² + ${z}² − 2${y}${z} cos ${X}`,
    display: `{${x}}² = {${y}}² + {${z}}² − 2 × {${y}} × {${z}} × cos({${X}})`,
    vars: [x, y, z, X],
    residual: (v: Values) =>
      v[x]! ** 2 - (v[y]! ** 2 + v[z]! ** 2 - 2 * v[y]! * v[z]! * cos(v[X]!)),
    solve: {
      [x]: (v: Values) => root(v[y]! ** 2 + v[z]! ** 2 - 2 * v[y]! * v[z]! * cos(v[X]!)),
      [X]: (v: Values) => acosDeg((v[y]! ** 2 + v[z]! ** 2 - v[x]! ** 2) / (2 * v[y]! * v[z]!)),
      // A side beside X: a quadratic, two lengths when both are positive (SSA).
      [y]: (v: Values) => beside(v[x]!, v[z]!, v[X]!),
      [z]: (v: Values) => beside(v[x]!, v[y]!, v[X]!),
    },
  };
}
/** The side beside angle X from the side x across from it and the other side y beside it. */
function beside(x: number, y: number, X: number) {
  const d = x * x - (y * sin(X)) ** 2;
  if (d < -1e-12) return undefined;
  const r = Math.sqrt(Math.max(0, d));
  const out = [y * cos(X) + r, y * cos(X) - r].filter((s, i) => s > 1e-9 && (i === 0 || r > 1e-9));
  return out.length ? out : undefined;
}
function cosineSteps(x: string, y: string, z: string, X: string) {
  const other = (s: string, t: string) => ({
    expr: `{${t}} × cos({${X}}) ± √({${x}}² − ({${t}} × sin({${X}}))²)`,
    how: `Law of cosines as a quadratic in ${s}: two lengths fit when both come out positive.`,
  });
  return {
    [y]: other(y, z),
    [z]: other(z, y),
    [x]: {
      expr: `√({${y}}² + {${z}}² − 2 × {${y}} × {${z}} × cos({${X}}))`,
      how: `Law of cosines: the two sides beside ${X} and the angle between them give the side across from it.`,
    },
    [X]: {
      expr: `cos⁻¹(({${y}}² + {${z}}² − {${x}}²) ÷ (2 × {${y}} × {${z}}))`,
      how: `Law of cosines turned round: three sides give the angle ${X}.`,
    },
  };
}

/** a sin B = b sin A: sides over the sines of their opposite angles are equal. */
function sines(x: string, X: string, y: string, Y: string): Relation {
  return {
    id: `${x}/sin ${X} = ${y}/sin ${Y}`,
    display: `{${x}} ÷ sin({${X}}) = {${y}} ÷ sin({${Y}})`,
    vars: [x, X, y, Y],
    residual: (v: Values) => v[x]! * sin(v[Y]!) - v[y]! * sin(v[X]!),
    solve: {
      [x]: (v: Values) => (v[y]! * sin(v[X]!)) / sin(v[Y]!),
      [y]: (v: Values) => (v[x]! * sin(v[Y]!)) / sin(v[X]!),
      [X]: (v: Values) => fitAngle(asinBoth((v[x]! * sin(v[Y]!)) / v[y]!), v[Y]!),
      [Y]: (v: Values) => fitAngle(asinBoth((v[y]! * sin(v[X]!)) / v[x]!), v[X]!),
    },
    message: (v: Values) => {
      const [s, , t, T] = v[X] === undefined ? [x, X, y, Y] : [y, Y, x, X];
      if (v[t] === undefined || v[T] === undefined || v[s] === undefined) return undefined;
      return v[s]! * sin(v[T]!) > v[t]! + 1e-9
        ? `${s} × sin ${T} is longer than ${t}: ${t} can't reach the third side, so no triangle fits.`
        : undefined;
    },
  };
}
/** The angles with a sine that still leave room for the angle `other` (under 180° together). */
function fitAngle(xs: number | number[] | undefined, other: number) {
  if (xs === undefined) return undefined;
  const ok = (Array.isArray(xs) ? xs : [xs]).filter((d) => d + other < 180 - 1e-9);
  return ok.length ? ok : undefined;
}
function sineSteps(x: string, X: string, y: string, Y: string) {
  return {
    [x]: {
      expr: `{${y}} × sin({${X}}) ÷ sin({${Y}})`,
      how: 'Law of sines: multiply both sides by sin of the angle across from the side.',
    },
    [y]: {
      expr: `{${x}} × sin({${Y}}) ÷ sin({${X}})`,
      how: 'Law of sines: multiply both sides by sin of the angle across from the side.',
    },
    [X]: inverseSine(X, `{${x}} × sin({${Y}}) ÷ {${y}}`),
    [Y]: inverseSine(Y, `{${y}} × sin({${X}}) ÷ {${x}}`),
  };
}
/** The angle from its sine: sin⁻¹, or 180° − sin⁻¹ when the angle is obtuse. */
function inverseSine(X: string, inner: string) {
  return {
    expr: (v: Values) => (v[X]! > 90 ? `180 − sin⁻¹(${inner})` : `sin⁻¹(${inner})`),
    how: (v: Values) =>
      v[X]! > 90
        ? 'Law of sines for the sine. The obtuse angle with that sine is 180° minus the inverse sine.'
        : 'Law of sines for the sine, then the inverse sine. An obtuse angle has the same sine: check which fits.',
  };
}
const triangleCloses: Relation = {
  id: 'each side is shorter than the other two together',
  constraint: true,
  display: '{a}, {b} and {c} close into a triangle',
  vars: ['a', 'b', 'c'],
  residual: (v: Values) => (2 * Math.max(v.a!, v.b!, v.c!) < v.a! + v.b! + v.c! ? 0 : 1),
  solve: {},
};

const angleSum: Relation = {
  id: 'A + B + C = 180°',
  display: '{A} + {B} + {C} = 180',
  vars: ['A', 'B', 'C'],
  residual: (v: Values) => v.A! + v.B! + v.C! - 180,
  solve: {
    A: (v: Values) => 180 - v.B! - v.C!,
    B: (v: Values) => 180 - v.A! - v.C!,
    C: (v: Values) => 180 - v.A! - v.B!,
  },
};
const angleSumSteps = {
  A: { expr: '180 − {B} − {C}', how: 'The angles of a triangle add to 180°.' },
  B: { expr: '180 − {A} − {C}', how: 'The angles of a triangle add to 180°.' },
  C: { expr: '180 − {A} − {B}', how: 'The angles of a triangle add to 180°.' },
};

const TRIANGLE_VARS: VariableDef[] = [
  side('a', 'Side a'),
  side('b', 'Side b'),
  side('c', 'Side c'),
  angle('A', 'Angle A'),
  angle('B', 'Angle B'),
  angle('C', 'Angle C'),
];

/** The six parts of a triangle, solved from any three with a side among them. */
function anyTriangle(
  id: string,
  title: string,
  use: string,
  example: Values,
  startWith: string[],
  representation: Representation,
  assumptions: string[],
): ModuleDef {
  return {
    id,
    title,
    use,
    assumptions,
    variables: TRIANGLE_VARS,
    relations: [
      angleSum,
      triangleCloses,
      cosines('a', 'b', 'c', 'A'),
      cosines('b', 'a', 'c', 'B'),
      cosines('c', 'a', 'b', 'C'),
      sines('a', 'A', 'b', 'B'),
      sines('b', 'B', 'c', 'C'),
      sines('a', 'A', 'c', 'C'),
    ],
    steps: {
      'A + B + C = 180°': angleSumSteps,
      'each side is shorter than the other two together': {},
      'a² = b² + c² − 2bc cos A': cosineSteps('a', 'b', 'c', 'A'),
      'b² = a² + c² − 2ac cos B': cosineSteps('b', 'a', 'c', 'B'),
      'c² = a² + b² − 2ab cos C': cosineSteps('c', 'a', 'b', 'C'),
      'a/sin A = b/sin B': sineSteps('a', 'A', 'b', 'B'),
      'b/sin B = c/sin C': sineSteps('b', 'B', 'c', 'C'),
      'a/sin A = c/sin C': sineSteps('a', 'A', 'c', 'C'),
    },
    example,
    startWith,
    representation,
  };
}

/** A consistent triangle from two sides and the angle between them (for examples). */
function sas(b: number, c: number, A: number): Values {
  const a = Math.sqrt(b * b + c * c - 2 * b * c * cos(A));
  const B = Math.acos((a * a + c * c - b * b) / (2 * a * c)) / RAD;
  return { a, b, c, A, B, C: 180 - A - B };
}
function sss(a: number, b: number, c: number): Values {
  const A = Math.acos((b * b + c * c - a * a) / (2 * b * c)) / RAD;
  const B = Math.acos((a * a + c * c - b * b) / (2 * a * c)) / RAD;
  return { a, b, c, A, B, C: 180 - A - B };
}
function asa(A: number, B: number, c: number): Values {
  const C = 180 - A - B;
  const k = c / sin(C);
  return { a: k * sin(A), b: k * sin(B), c, A, B, C };
}

const LAWS = [
  'The sides a, b and c are across from the angles A, B and C.',
  'The angles add to 180°.',
  'Law of cosines: c² = a² + b² − 2ab cos C. Law of sines: a/sin A = b/sin B = c/sin C.',
];
const TRI: Representation = {
  kind: 'triangleSolver',
  parts: { a: 'a', b: 'b', c: 'c', A: 'A', B: 'B', C: 'C' },
};
const PAIR = (criterion?: 'HL'): Representation => ({
  kind: 'triangleSolver',
  parts: { a: 'a', b: 'b', c: 'c', A: 'A', B: 'B', C: 'C' },
  congruence: criterion ? { criterion } : {},
});

// ─── Right triangles: sin, cos and tan of θ ──────────────────────────────────

/** A right triangle with the right angle at C, θ = A at the bottom left. */
function rightTriangle(
  id: string,
  title: string,
  use: string,
  names: { a: string; b: string; c: string },
  example: Values,
  startWith: string[],
  representation: Representation,
  assumptions: string[],
  extra: { variables?: VariableDef[]; relations?: Relation[]; steps?: ModuleDef['steps'] } = {},
): ModuleDef {
  return {
    id,
    title,
    use,
    assumptions,
    variables: [
      side('a', names.a),
      side('b', names.b),
      side('c', names.c, 150),
      angle('A', 'Angle θ', 'θ', 89),
      ...(extra.variables ?? []),
    ],
    relations: [
      {
        id: 'sin θ = a/c',
        display: 'sin({A}) = {a} ÷ {c}',
        vars: ['A', 'a', 'c'],
        residual: (v: Values) => sin(v.A!) * v.c! - v.a!,
        solve: {
          a: (v: Values) => v.c! * sin(v.A!),
          c: (v: Values) => v.a! / sin(v.A!),
          A: (v: Values) => (v.a! <= v.c! ? Math.asin(v.a! / v.c!) / RAD : undefined),
        },
      },
      {
        id: 'cos θ = b/c',
        display: 'cos({A}) = {b} ÷ {c}',
        vars: ['A', 'b', 'c'],
        residual: (v: Values) => cos(v.A!) * v.c! - v.b!,
        solve: {
          b: (v: Values) => v.c! * cos(v.A!),
          c: (v: Values) => v.b! / cos(v.A!),
          A: (v: Values) => (v.b! <= v.c! ? acosDeg(v.b! / v.c!) : undefined),
        },
      },
      {
        id: 'tan θ = a/b',
        display: 'tan({A}) = {a} ÷ {b}',
        vars: ['A', 'a', 'b'],
        residual: (v: Values) => tan(v.A!) * v.b! - v.a!,
        solve: {
          a: (v: Values) => v.b! * tan(v.A!),
          b: (v: Values) => v.a! / tan(v.A!),
          A: (v: Values) => atanDeg(v.a! / v.b!),
        },
      },
      ...(extra.relations ?? []),
    ],
    steps: {
      'sin θ = a/c': {
        a: { expr: '{c} × sin({A})', how: 'Opposite = hypotenuse × sin θ.' },
        c: { expr: '{a} ÷ sin({A})', how: 'Hypotenuse = opposite ÷ sin θ.' },
        A: { expr: 'sin⁻¹({a} ÷ {c})', how: 'The inverse sine of opposite over hypotenuse.' },
      },
      'cos θ = b/c': {
        b: { expr: '{c} × cos({A})', how: 'Adjacent = hypotenuse × cos θ.' },
        c: { expr: '{b} ÷ cos({A})', how: 'Hypotenuse = adjacent ÷ cos θ.' },
        A: { expr: 'cos⁻¹({b} ÷ {c})', how: 'The inverse cosine of adjacent over hypotenuse.' },
      },
      'tan θ = a/b': {
        a: { expr: '{b} × tan({A})', how: 'Opposite = adjacent × tan θ.' },
        b: { expr: '{a} ÷ tan({A})', how: 'Adjacent = opposite ÷ tan θ.' },
        A: { expr: 'tan⁻¹({a} ÷ {b})', how: 'The inverse tangent of opposite over adjacent.' },
      },
      ...(extra.steps ?? {}),
    },
    example,
    startWith,
    representation,
  };
}
const rightValues = (c: number, A: number): Values => ({ a: c * sin(A), b: c * cos(A), c, A });

/** A special right triangle: the short leg a, the long leg b and the hypotenuse c. */
function special(
  id: string,
  title: string,
  use: string,
  kind: '45-45-90' | '30-60-90',
  example: Values,
  startWith: string[],
): ModuleDef {
  const legK = kind === '45-45-90' ? 1 : Math.sqrt(3);
  const hypK = kind === '45-45-90' ? Math.SQRT2 : 2;
  const hypText = kind === '45-45-90' ? '√2' : '2';
  return {
    id,
    title,
    use,
    assumptions:
      kind === '45-45-90'
        ? [
            'A 45-45-90 triangle is half a square: its legs are equal.',
            'The hypotenuse is a leg times √2 (the diagonal of the square).',
          ]
        : [
            'A 30-60-90 triangle is half an equilateral triangle.',
            'The hypotenuse is twice the short leg; the long leg is the short leg times √3.',
          ],
    variables: [
      side('a', kind === '45-45-90' ? 'Leg a' : 'Short leg a'),
      side('b', kind === '45-45-90' ? 'Leg b' : 'Long leg b', 200),
      side('c', 'Hypotenuse c', 200),
    ],
    relations: [
      {
        id: kind === '45-45-90' ? 'b = a' : 'b = a√3',
        display: kind === '45-45-90' ? '{b} = {a}' : '{b} = {a} × √3',
        vars: ['b', 'a'],
        residual: (v: Values) => v.b! - v.a! * legK,
        solve: { b: (v: Values) => v.a! * legK, a: (v: Values) => v.b! / legK },
      },
      {
        id: kind === '45-45-90' ? 'c = a√2' : 'c = 2a',
        display: kind === '45-45-90' ? '{c} = {a} × √2' : '{c} = 2 × {a}',
        vars: ['c', 'a'],
        residual: (v: Values) => v.c! - v.a! * hypK,
        solve: { c: (v: Values) => v.a! * hypK, a: (v: Values) => v.c! / hypK },
      },
    ],
    steps: {
      [kind === '45-45-90' ? 'b = a' : 'b = a√3']: {
        b: {
          expr: kind === '45-45-90' ? '{a}' : '{a} × √3',
          how:
            kind === '45-45-90' ? 'The legs are equal.' : 'The long leg is √3 times the short leg.',
        },
        a: {
          expr: kind === '45-45-90' ? '{b}' : '{b} ÷ √3',
          how: kind === '45-45-90' ? 'The legs are equal.' : 'Divide the long leg by √3.',
        },
      },
      [kind === '45-45-90' ? 'c = a√2' : 'c = 2a']: {
        c: {
          expr: kind === '45-45-90' ? '{a} × √2' : '2 × {a}',
          how: `The hypotenuse is the ${kind === '45-45-90' ? 'leg' : 'short leg'} times ${hypText}.`,
        },
        a: {
          expr: kind === '45-45-90' ? '{c} ÷ √2' : '{c} ÷ 2',
          how: `Divide the hypotenuse by ${hypText}.`,
        },
      },
    },
    example,
    startWith,
    representation: {
      kind: 'triangleSolver',
      parts: { a: 'a', b: 'b', c: 'c' },
      special: kind,
    },
  };
}

/** H04 triangleSolver demos. */
const TRIANGLE_DEMOS: ModuleDef[] = [
  // H04 triangleSolver: solving any triangle.
  anyTriangle(
    'g.m10-law-sines-cosines-sas',
    'Two sides and the angle between them (SAS)',
    'Use this for “b = 8, c = 6 and A = 40°: find a, B and C.”',
    sas(8, 6, 40),
    ['b', 'c', 'A'],
    TRI,
    LAWS,
  ),
  anyTriangle(
    'g.m10-law-sines-cosines-ssa',
    'The ambiguous case (SSA)',
    'Use this for “a = 6, b = 8 and A = 40°: how many triangles, and what is B?”',
    (() => {
      const B = Math.asin((8 * sin(40)) / 6) / RAD;
      const C = 180 - 40 - B;
      return { a: 6, b: 8, A: 40, B, C, c: (6 * sin(C)) / sin(40) };
    })(),
    ['a', 'b', 'A'],
    TRI,
    [...LAWS, 'Two sides and an angle across from one of them can fit two triangles, one or none.'],
  ),
  anyTriangle(
    'g.m10-law-sines-cosines-sss',
    'Three sides (SSS), nearly flat',
    'Use this for “The sides are 5, 7 and 11.5: find the largest angle.”',
    sss(5, 7, 11.5),
    ['a', 'b', 'c'],
    TRI,
    [...LAWS, 'Each side must be shorter than the other two together, or the sides do not close.'],
  ),
  anyTriangle(
    'g.m10-law-sines-cosines-asa',
    'Two angles and the side between them (ASA)',
    'Use this for “A = 50°, B = 60° and c = 10: find a and b.”',
    asa(50, 60, 10),
    ['A', 'B', 'c'],
    TRI,
    LAWS,
  ),
  // Congruence: two triangles with matching marks and the criterion.
  ...(
    [
      ['sss', 'SSS', sss(5, 6, 7), ['a', 'b', 'c'], 'three pairs of sides are equal'],
      [
        'sas',
        'SAS',
        sas(6, 5, 50),
        ['b', 'c', 'A'],
        'two sides and the angle between them are equal',
      ],
      [
        'asa',
        'ASA',
        asa(45, 65, 7),
        ['A', 'B', 'c'],
        'two angles and the side between them are equal',
      ],
      [
        'aas',
        'AAS',
        asa(45, 65, 7),
        ['A', 'B', 'a'],
        'two angles and a side not between them are equal',
      ],
      [
        'hl',
        'HL',
        sss(3, 4, 5),
        ['c', 'a', 'C'],
        'right triangles have equal hypotenuses and a pair of equal legs',
      ],
      [
        'ssa',
        'SSA is not a test',
        {
          a: 6,
          b: 8,
          A: 40,
          ...(() => {
            const B = Math.asin((8 * sin(40)) / 6) / RAD;
            const C = 180 - 40 - B;
            return { B, C, c: (6 * sin(C)) / sin(40) };
          })(),
        },
        ['a', 'b', 'A'],
        'two sides and a non-included angle can fit two different triangles',
      ],
    ] as const
  ).map(([slug, name, example, start, why]) =>
    anyTriangle(
      `g.m10-congruence-${slug}`,
      name === 'SSA is not a test' ? name : `Congruent by ${name}`,
      `Use this for “Which test shows the triangles are congruent, when ${why}?”`,
      example as Values,
      [...start],
      PAIR(slug === 'hl' ? 'HL' : undefined),
      [
        'Congruent triangles have all six parts equal: A = D, B = E, C = F, a = d, b = e, c = f.',
        `${name === 'SSA is not a test' ? 'SSA' : name}: ${why}.`,
        'Tick marks pair the equal sides; arcs pair the equal angles.',
      ],
    ),
  ),
  // Similarity: a second triangle at a scale factor k.
  {
    ...anyTriangle(
      'g.m10-similarity-scale',
      'Similar triangles at a scale factor',
      'Use this for “△DEF ∼ △ABC with scale factor 1.5; a = 4: find d.”',
      { ...sss(4, 5, 6), k: 1.5, d: 6, e: 7.5, f: 9 },
      ['a', 'b', 'c', 'k'],
      {
        kind: 'triangleSolver',
        parts: { a: 'a', b: 'b', c: 'c', A: 'A', B: 'B', C: 'C' },
        similar: { scale: 'k', sides: { a: 'd', b: 'e', c: 'f' } },
      },
      [
        'Similar triangles have equal angles; every side of one is k times its match.',
        'The scale factor k is a side of △DEF over its match in △ABC.',
      ],
    ),
    variables: [
      ...TRIANGLE_VARS,
      { id: 'k', symbol: 'k', name: 'Scale factor', min: 0.1, max: 10, step: 0.1 },
      side('d', 'Side d', 1000),
      side('e', 'Side e', 1000),
      side('f', 'Side f', 1000),
    ],
    relations: [
      angleSum,
      triangleCloses,
      cosines('a', 'b', 'c', 'A'),
      cosines('b', 'a', 'c', 'B'),
      cosines('c', 'a', 'b', 'C'),
      ...(['a', 'b', 'c'] as const).map((p, i): Relation => {
        const q = ['d', 'e', 'f'][i]!;
        return {
          id: `${q} = k${p}`,
          display: `{${q}} = {k} × {${p}}`,
          vars: [q, 'k', p],
          residual: (v: Values) => v[q]! - v.k! * v[p]!,
          solve: {
            [q]: (v: Values) => v.k! * v[p]!,
            k: (v: Values) => (v[p]! ? v[q]! / v[p]! : undefined),
            [p]: (v: Values) => (v.k! ? v[q]! / v.k! : undefined),
          },
        };
      }),
    ],
    steps: {
      'A + B + C = 180°': angleSumSteps,
      'each side is shorter than the other two together': {},
      'a² = b² + c² − 2bc cos A': cosineSteps('a', 'b', 'c', 'A'),
      'b² = a² + c² − 2ac cos B': cosineSteps('b', 'a', 'c', 'B'),
      'c² = a² + b² − 2ab cos C': cosineSteps('c', 'a', 'b', 'C'),
      ...Object.fromEntries(
        (['a', 'b', 'c'] as const).map((p, i) => {
          const q = ['d', 'e', 'f'][i]!;
          return [
            `${q} = k${p}`,
            {
              [q]: { expr: `{k} × {${p}}`, how: 'Each side of the copy is k times its match.' },
              k: {
                expr: `{${q}} ÷ {${p}}`,
                how: 'The scale factor is a side of the copy over its match.',
              },
              [p]: { expr: `{${q}} ÷ {k}`, how: 'Divide the copy’s side by the scale factor.' },
            },
          ];
        }),
      ),
    },
  },
  // Right-triangle trig.
  rightTriangle(
    'g.m10-right-triangle-trig-sohcahtoa',
    'Sine, cosine and tangent of θ',
    'Use this for “The hypotenuse is 10 and θ = 35°: find the opposite and adjacent sides.”',
    { a: 'Opposite a', b: 'Adjacent b', c: 'Hypotenuse c' },
    rightValues(10, 35),
    ['c', 'A'],
    { kind: 'triangleSolver', parts: { a: 'a', b: 'b', c: 'c', A: 'A' }, trig: { angle: 'A' } },
    [
      'The right angle is at C; θ is the angle at A.',
      'sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent.',
    ],
  ),
  rightTriangle(
    'g.m10-right-triangle-trig-ladder',
    'A ladder against a wall',
    'Use this for “A 6 m ladder leans on a wall at 70° to the ground. How high does it reach?”',
    { a: 'Height up the wall a', b: 'Foot from the wall b', c: 'Ladder c' },
    rightValues(6, 70),
    ['c', 'A'],
    {
      kind: 'triangleSolver',
      parts: { a: 'a', b: 'b', c: 'c', A: 'A' },
      trig: { angle: 'A' },
      scene: { kind: 'ladder' },
    },
    [
      'The wall stands straight up from level ground: the right angle is at its foot.',
      'The ladder is the hypotenuse; θ is its angle with the ground.',
    ],
  ),
  rightTriangle(
    'g.m10-right-triangle-trig-ramp',
    'A ramp',
    'Use this for “A ramp rises 0.5 m over 6 m along the ground. What angle does it make?”',
    { a: 'Rise a', b: 'Run b', c: 'Ramp length c' },
    { a: 0.5, b: 6, c: Math.hypot(0.5, 6), A: atanDeg(0.5 / 6) },
    ['a', 'b'],
    {
      kind: 'triangleSolver',
      parts: { a: 'a', b: 'b', c: 'c', A: 'A' },
      trig: { angle: 'A' },
      scene: { kind: 'ramp' },
    },
    [
      'The ramp rises over a level run: the right angle is under its top.',
      'θ is the ramp’s angle with the ground.',
    ],
  ),
  rightTriangle(
    'g.m10-right-triangle-trig-elevation',
    'Angle of elevation',
    'Use this for “From 30 m away the angle of elevation to the treetop is 40°. Eyes 1.5 m up: how tall is the tree?”',
    { a: 'Height above the eye a', b: 'Distance b', c: 'Line of sight c' },
    { ...rightValues(30 / cos(40), 40), e: 1.5, t: 30 * tan(40) + 1.5 },
    ['b', 'A', 'e'],
    {
      kind: 'triangleSolver',
      parts: { a: 'a', b: 'b', c: 'c', A: 'A' },
      trig: { angle: 'A' },
      scene: { kind: 'sight', eye: 'e' },
    },
    [
      'The angle of elevation θ is measured up from the level line through the eye.',
      'The tree stands straight up: the height above the eye is the side opposite θ.',
      'The tree’s height adds the eye height to that side.',
    ],
    {
      variables: [side('e', 'Eye height e', 3), side('t', 'Tree height t', 300)],
      relations: [
        {
          id: 't = a + e',
          display: '{t} = {a} + {e}',
          vars: ['t', 'a', 'e'],
          residual: (v: Values) => v.t! - v.a! - v.e!,
          solve: {
            t: (v: Values) => v.a! + v.e!,
            a: (v: Values) => v.t! - v.e!,
            e: (v: Values) => v.t! - v.a!,
          },
        },
      ],
      steps: {
        't = a + e': {
          t: { expr: '{a} + {e}', how: 'Add the eye height to the height above the eye.' },
          a: { expr: '{t} − {e}', how: 'Take the eye height off the tree’s height.' },
          e: { expr: '{t} − {a}', how: 'The eye height is what is left.' },
        },
      },
    },
  ),
  special(
    'g.m10-special-right-triangles-45',
    'The 45-45-90 triangle',
    'Use this for “A leg of a 45-45-90 triangle is 5. Find the hypotenuse.”',
    '45-45-90',
    { a: 5, b: 5, c: 5 * Math.SQRT2 },
    ['a'],
  ),
  special(
    'g.m10-special-right-triangles-30',
    'The 30-60-90 triangle',
    'Use this for “The long leg of a 30-60-90 triangle is 6. Find the short leg and the hypotenuse.”',
    '30-60-90',
    { a: 2 * Math.sqrt(3), b: 6, c: 4 * Math.sqrt(3) },
    ['b'],
  ),
];

// ─── H05 markedFigure ─────────────────────────────────────────────────────────

/**
 * A rule solved one way (or both): `target` from `from`, with its step text; `back` gives the
 * other rearrangements when the rule is a simple sum or product.
 */
interface Rule {
  relation: Relation;
  steps: Record<string, { expr: string; how: string }>;
}
function rule(
  id: string,
  display: string,
  solve: Record<string, [(v: Values) => number | undefined, string, string]>,
  residual: (v: Values) => number,
): Rule {
  const vars = [...display.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!);
  return {
    relation: {
      id,
      display,
      vars: [...new Set(vars)],
      residual,
      solve: Object.fromEntries(Object.entries(solve).map(([k, [fn]]) => [k, fn])),
    },
    steps: Object.fromEntries(
      Object.entries(solve).map(([k, [, expr, how]]) => [k, { expr, how }]),
    ),
  };
}
/** A page stand-in from its rules. */
function figureDemo(d: {
  id: string;
  title: string;
  use: string;
  assumptions: string[];
  variables: VariableDef[];
  rules: Rule[];
  example: Values;
  startWith: string[];
  representation: Representation;
  standalone?: ModuleDef['standalone'];
}): ModuleDef {
  // A triangle from its sides: the sides must close.
  const closes = d.variables.includes(TRI_SIDES[0]!);
  return {
    id: d.id,
    title: d.title,
    use: d.use,
    assumptions: d.assumptions,
    variables: d.variables,
    relations: [...(closes ? [triangleCloses] : []), ...d.rules.map((r) => r.relation)],
    steps: {
      ...(closes ? { [triangleCloses.id]: {} } : {}),
      ...Object.fromEntries(d.rules.map((r) => [r.relation.id, r.steps])),
    },
    example: d.example,
    startWith: d.startWith,
    representation: d.representation,
    ...(d.standalone ? { standalone: d.standalone } : {}),
  };
}
const der = (v: VariableDef): VariableDef => ({ ...v, derived: true });

/** y = 180 − x (a linear pair) and y = x (equal angles), both ways. */
const supplement = (x: string, y: string, why: string) =>
  rule(
    `${y} = 180° − ${x}`,
    `{${y}} = 180 − {${x}}`,
    {
      [y]: [(v) => 180 - v[x]!, `180 − {${x}}`, why],
      [x]: [(v) => 180 - v[y]!, `180 − {${y}}`, why],
    },
    (v) => v[y]! - (180 - v[x]!),
  );
const equal = (x: string, y: string, why: string) =>
  rule(
    `${y} = ${x}`,
    `{${y}} = {${x}}`,
    { [y]: [(v) => v[x]!, `{${x}}`, why], [x]: [(v) => v[y]!, `{${y}}`, why] },
    (v) => v[y]! - v[x]!,
  );

/** The median from A, and G two thirds of the way along it (sides a = BC, b = CA, c = AB). */
const median = (v: Values) => 0.5 * Math.sqrt(2 * v.b! ** 2 + 2 * v.c! ** 2 - v.a! ** 2);
/** Heron's area from the three sides. */
const heron = (v: Values) => {
  const s = (v.a! + v.b! + v.c!) / 2;
  const q = s * (s - v.a!) * (s - v.b!) * (s - v.c!);
  return q > 0 ? Math.sqrt(q) : undefined;
};
const TRI_SIDES = [side('a', 'Side a (BC)'), side('b', 'Side b (CA)'), side('c', 'Side c (AB)')];
const areaRule = rule(
  'K = √(s(s − a)(s − b)(s − c))',
  '{K} = √(({a} + {b} + {c}) ÷ 2 × (({b} + {c} − {a}) ÷ 2) × (({a} + {c} − {b}) ÷ 2) × (({a} + {b} − {c}) ÷ 2))',
  {
    K: [
      heron,
      '√(({a} + {b} + {c}) ÷ 2 × (({b} + {c} − {a}) ÷ 2) × (({a} + {c} − {b}) ÷ 2) × (({a} + {b} − {c}) ÷ 2))',
      'Heron’s formula: the half-perimeter s times s minus each side, then the square root.',
    ],
  },
  (v) => v.K! - (heron(v) ?? NaN),
);
const sidesOf = (a: number, b: number, c: number): Values => ({ a, b, c });

const FIGURE_DEMOS: ModuleDef[] = [
  // Parallel lines cut by a transversal.
  figureDemo({
    id: 'g.m10-parallel-lines-corresponding',
    title: 'Corresponding angles',
    use: 'Use this for “Lines ℓ and m are parallel and ∠1 = 65°. Find ∠5.”',
    assumptions: [
      'Lines ℓ and m are parallel; the transversal crosses both.',
      'Corresponding angles sit in the same place at each crossing: 1 and 5, 2 and 6, 3 and 7, 4 and 8.',
      'When the lines are parallel, corresponding angles are equal.',
    ],
    variables: [angle('x', 'Angle 1', 'x'), angle('y', 'Angle 5', 'y')],
    rules: [equal('x', 'y', 'Parallel lines: corresponding angles are equal.')],
    example: { x: 65, y: 65 },
    startWith: ['x'],
    representation: {
      kind: 'markedFigure',
      transversal: { angle: 'x', second: 'y', highlight: [1, 5], labels: { 1: 'x', 5: 'y' } },
    },
  }),
  figureDemo({
    id: 'g.m10-parallel-lines-alternate-interior',
    title: 'Alternate interior angles',
    use: 'Use this for “ℓ ∥ m and ∠1 = 110°. Find ∠3 and ∠6.”',
    assumptions: [
      'Lines ℓ and m are parallel.',
      'Angles 1 and 3 make a straight line, so they add to 180°.',
      'Alternate interior angles (3 and 6, 4 and 5) lie between the lines on opposite sides of the transversal; they are equal.',
    ],
    variables: [angle('a', 'Angle 1', 'a'), angle('x', 'Angle 3', 'x'), angle('y', 'Angle 6', 'y')],
    rules: [
      supplement('a', 'x', 'A linear pair adds to 180°.'),
      equal('x', 'y', 'Parallel lines: alternate interior angles are equal.'),
    ],
    example: { a: 110, x: 70, y: 70 },
    startWith: ['a'],
    representation: {
      kind: 'markedFigure',
      transversal: { angle: 'a', highlight: [3, 6], labels: { 1: 'a', 3: 'x', 6: 'y' } },
    },
  }),
  figureDemo({
    id: 'g.m10-parallel-lines-same-side',
    title: 'Same-side interior angles',
    use: 'Use this for “ℓ ∥ m and ∠4 = 58°. Find ∠6.”',
    assumptions: [
      'Lines ℓ and m are parallel.',
      'Same-side interior angles (3 and 5, 4 and 6) are between the lines on one side of the transversal; they add to 180°.',
      'Angle 4 and angle 1 are vertical angles, so they are equal.',
    ],
    variables: [angle('a', 'Angle 1', 'a'), angle('x', 'Angle 4', 'x'), angle('y', 'Angle 6', 'y')],
    rules: [
      equal('a', 'x', 'Vertical angles are equal.'),
      supplement('x', 'y', 'Parallel lines: same-side interior angles add to 180°.'),
    ],
    example: { a: 58, x: 58, y: 122 },
    startWith: ['x'],
    representation: {
      kind: 'markedFigure',
      transversal: { angle: 'a', highlight: [4, 6], labels: { 1: 'a', 4: 'x', 6: 'y' } },
    },
  }),
  figureDemo({
    id: 'g.m10-parallel-lines-converse',
    title: 'Are the lines parallel?',
    use: 'Use this for “∠1 = 72° and ∠5 = 68°. Are the lines parallel?”',
    assumptions: [
      'Converse: if corresponding angles are equal, the lines are parallel.',
      'If they differ, the lines meet: the second line is tilted by the difference.',
    ],
    variables: [
      angle('a', 'Angle 1', 'a'),
      angle('b', 'Angle 5', 'b'),
      { id: 'd', symbol: 'd', name: 'Difference', unit: '°', min: -178, max: 178, step: 1 },
    ],
    rules: [
      rule(
        'd = b − a',
        '{d} = {b} − {a}',
        {
          d: [
            (v) => v.b! - v.a!,
            '{b} − {a}',
            'The tilt between the lines: 0° only when they are parallel.',
          ],
          b: [(v) => v.a! + v.d!, '{a} + {d}', 'Angle 5 is angle 1 turned by the tilt.'],
          a: [(v) => v.b! - v.d!, '{b} − {d}', 'Angle 1 is angle 5 less the tilt.'],
        },
        (v) => v.d! - (v.b! - v.a!),
      ),
    ],
    example: { a: 72, b: 68, d: -4 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'markedFigure',
      transversal: { angle: 'a', second: 'b', highlight: [1, 5], labels: { 1: 'a', 5: 'b' } },
    },
  }),
  // Triangle centers and the midsegment.
  figureDemo({
    id: 'g.m10-triangle-relationships-centroid',
    title: 'Medians and the centroid',
    use: 'Use this for “The median AD is 9. How long are AG and GD?”',
    assumptions: [
      'A median joins a corner to the middle of the opposite side.',
      'The three medians meet at the centroid G, two thirds of the way from each corner.',
      'The median from A: m = ½√(2b² + 2c² − a²).',
    ],
    variables: [
      ...TRI_SIDES,
      der(side('m', 'Median m (AD)')),
      der(side('g', 'AG')),
      der(side('k', 'GD')),
    ],
    rules: [
      rule(
        'm = ½√(2b² + 2c² − a²)',
        '{m} = √(2 × {b}² + 2 × {c}² − {a}²) ÷ 2',
        { m: [median, '√(2 × {b}² + 2 × {c}² − {a}²) ÷ 2', 'The length of the median from A.'] },
        (v) => v.m! - median(v),
      ),
      rule(
        'AG = 2m/3',
        '{g} = 2 × {m} ÷ 3',
        {
          g: [
            (v) => (2 * v.m!) / 3,
            '2 × {m} ÷ 3',
            'The centroid is two thirds of the way from the corner.',
          ],
        },
        (v) => v.g! - (2 * v.m!) / 3,
      ),
      rule(
        'GD = m/3',
        '{k} = {m} ÷ 3',
        { k: [(v) => v.m! / 3, '{m} ÷ 3', 'The last third of the median.'] },
        (v) => v.k! - v.m! / 3,
      ),
    ],
    example: (() => {
      const v = sidesOf(8, 7, 6);
      const m = median(v);
      return { ...v, m, g: (2 * m) / 3, k: m / 3 };
    })(),
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'markedFigure',
      triangle: {
        sides: ['a', 'b', 'c'],
        lines: 'median',
        center: true,
        labels: { AG: 'g', GD: 'k' },
      },
    },
  }),
  figureDemo({
    id: 'g.m10-triangle-relationships-incenter',
    title: 'Angle bisectors and the incenter',
    use: 'Use this for “The sides are 13, 14 and 15. Find the radius of the inscribed circle.”',
    assumptions: [
      'The angle bisectors meet at the incenter I, the same distance r from all three sides.',
      'That distance is the radius of the circle inside the triangle: r = K/s, the area over half the perimeter.',
    ],
    variables: [...TRI_SIDES, der(side('K', 'Area K', 10000)), der(side('r', 'Inradius r'))],
    rules: [
      areaRule,
      rule(
        'r = K/s',
        '{r} = {K} ÷ (({a} + {b} + {c}) ÷ 2)',
        {
          r: [
            (v) => v.K! / ((v.a! + v.b! + v.c!) / 2),
            '{K} ÷ (({a} + {b} + {c}) ÷ 2)',
            'The area over the half-perimeter.',
          ],
        },
        (v) => v.r! - v.K! / ((v.a! + v.b! + v.c!) / 2),
      ),
    ],
    example: (() => {
      const v = sidesOf(14, 15, 13);
      const K = heron(v)!;
      return { ...v, K, r: K / 21 };
    })(),
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'markedFigure',
      triangle: { sides: ['a', 'b', 'c'], lines: 'bisector', center: true, labels: { IT: 'r' } },
    },
  }),
  figureDemo({
    id: 'g.m10-triangle-relationships-circumcenter',
    title: 'Perpendicular bisectors and the circumcenter',
    use: 'Use this for “Find the radius of the circle through the corners of a 6, 8, 9 triangle.”',
    assumptions: [
      'The perpendicular bisectors of the sides meet at the circumcenter O, the same distance R from all three corners.',
      'R = abc ÷ 4K, where K is the area.',
    ],
    variables: [...TRI_SIDES, der(side('K', 'Area K', 10000)), der(side('R', 'Circumradius R'))],
    rules: [
      areaRule,
      rule(
        'R = abc/4K',
        '{R} = {a} × {b} × {c} ÷ (4 × {K})',
        {
          R: [
            (v) => (v.a! * v.b! * v.c!) / (4 * v.K!),
            '{a} × {b} × {c} ÷ (4 × {K})',
            'The product of the sides over four times the area.',
          ],
        },
        (v) => v.R! - (v.a! * v.b! * v.c!) / (4 * v.K!),
      ),
    ],
    example: (() => {
      const v = sidesOf(9, 8, 6);
      const K = heron(v)!;
      return { ...v, K, R: (9 * 8 * 6) / (4 * K) };
    })(),
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'markedFigure',
      triangle: {
        sides: ['a', 'b', 'c'],
        lines: 'perpendicular',
        center: true,
        labels: { OA: 'R' },
      },
    },
  }),
  figureDemo({
    id: 'g.m10-triangle-relationships-orthocenter',
    title: 'Altitudes and the orthocenter (obtuse)',
    use: 'Use this for “In a triangle with sides 4, 5 and 8, how long is the altitude to the longest side?”',
    assumptions: [
      'An altitude runs from a corner at right angles to the line of the opposite side.',
      'In an obtuse triangle two feet fall outside, and the altitudes meet outside at the orthocenter H.',
      'The altitude to side a: h = 2K ÷ a.',
    ],
    variables: [...TRI_SIDES, der(side('K', 'Area K', 10000)), der(side('h', 'Altitude h (AD)'))],
    rules: [
      areaRule,
      rule(
        'h = 2K/a',
        '{h} = 2 × {K} ÷ {a}',
        { h: [(v) => (2 * v.K!) / v.a!, '2 × {K} ÷ {a}', 'Twice the area over the base.'] },
        (v) => v.h! - (2 * v.K!) / v.a!,
      ),
    ],
    example: (() => {
      const v = sidesOf(8, 5, 4);
      const K = heron(v)!;
      return { ...v, K, h: (2 * K) / 8 };
    })(),
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'markedFigure',
      triangle: { sides: ['a', 'b', 'c'], lines: 'altitude', center: true, labels: { AD: 'h' } },
    },
  }),
  figureDemo({
    id: 'g.m10-triangle-relationships-midsegment',
    title: 'The midsegment',
    use: 'Use this for “D and E are the midpoints of AB and AC, and BC = 12. Find DE.”',
    assumptions: [
      'A midsegment joins the midpoints of two sides.',
      'It is parallel to the third side and half as long.',
    ],
    variables: [...TRI_SIDES, side('m', 'Midsegment m (DE)')],
    rules: [
      rule(
        'm = a/2',
        '{m} = {a} ÷ 2',
        {
          m: [(v) => v.a! / 2, '{a} ÷ 2', 'Half the third side.'],
          a: [(v) => 2 * v.m!, '2 × {m}', 'The third side is twice the midsegment.'],
        },
        (v) => v.m! - v.a! / 2,
      ),
    ],
    example: { a: 12, b: 9, c: 7, m: 6 },
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'markedFigure',
      triangle: { sides: ['a', 'b', 'c'], lines: 'midsegment', labels: { DE: 'm', BC: 'a' } },
    },
  }),
  // Quadrilateral families.
  figureDemo({
    id: 'g.m10-quadrilaterals-parallelogram',
    title: 'Parallelogram',
    use: 'Use this for “In parallelogram ABCD, ∠A = 65°. Find ∠B.”',
    assumptions: [
      'Opposite sides are parallel and equal; opposite angles are equal.',
      'Angles next to each other add to 180°.',
      'The diagonals cut each other in half.',
    ],
    variables: [
      side('w', 'Base AB'),
      side('h', 'Height h'),
      angle('A', 'Angle A'),
      der(angle('B', 'Angle B')),
    ],
    rules: [supplement('A', 'B', 'Consecutive angles of a parallelogram add to 180°.')],
    example: { w: 7, h: 4, A: 65, B: 115 },
    startWith: ['w', 'h', 'A'],
    representation: {
      kind: 'markedFigure',
      quadrilateral: {
        family: 'parallelogram',
        width: 'w',
        height: 'h',
        angle: 'A',
        diagonals: true,
        labels: { AB: 'w', DAB: 'A', ABC: 'B' },
      },
    },
    standalone: {
      vars: ['w', 'h'],
      why: 'The base and height fix the size; the angles follow from ∠A alone.',
    },
  }),
  figureDemo({
    id: 'g.m10-quadrilaterals-rectangle',
    title: 'Rectangle and its diagonals',
    use: 'Use this for “A rectangle is 8 by 6. How long is each diagonal?”',
    assumptions: [
      'Four right angles; the diagonals are equal and cut each other in half.',
      'Diagonal: d² = w² + h².',
    ],
    variables: [side('w', 'Width w'), side('h', 'Height h'), side('d', 'Diagonal d', 150)],
    rules: [
      rule(
        'd² = w² + h²',
        '{d}² = {w}² + {h}²',
        {
          d: [
            (v) => Math.hypot(v.w!, v.h!),
            '√({w}² + {h}²)',
            'The diagonal is the hypotenuse of a right triangle.',
          ],
          w: [
            (v) => root(v.d! ** 2 - v.h! ** 2),
            '√({d}² − {h}²)',
            'Take h² from d², then the square root.',
          ],
          h: [
            (v) => root(v.d! ** 2 - v.w! ** 2),
            '√({d}² − {w}²)',
            'Take w² from d², then the square root.',
          ],
        },
        (v) => v.d! ** 2 - v.w! ** 2 - v.h! ** 2,
      ),
    ],
    example: { w: 8, h: 6, d: 10 },
    startWith: ['w', 'h'],
    representation: {
      kind: 'markedFigure',
      quadrilateral: {
        family: 'rectangle',
        width: 'w',
        height: 'h',
        diagonals: true,
        labels: { AC: 'd' },
      },
    },
  }),
  figureDemo({
    id: 'g.m10-quadrilaterals-rhombus',
    title: 'Rhombus and its diagonals',
    use: 'Use this for “A rhombus has side 5 and ∠A = 74°. How long are its diagonals?”',
    assumptions: [
      'Four equal sides; the diagonals cut each other in half at right angles and bisect the angles.',
      'Diagonals: p = 2s cos(A ÷ 2) and q = 2s sin(A ÷ 2).',
    ],
    variables: [
      side('s', 'Side s'),
      angle('A', 'Angle A'),
      der(side('p', 'Diagonal p (AC)')),
      der(side('q', 'Diagonal q (BD)')),
    ],
    rules: [
      rule(
        'p = 2s cos(A/2)',
        '{p} = 2 × {s} × cos({A} ÷ 2)',
        {
          p: [
            (v) => 2 * v.s! * cos(v.A! / 2),
            '2 × {s} × cos({A} ÷ 2)',
            'Half of AC is the side times cos of half of A.',
          ],
        },
        (v) => v.p! - 2 * v.s! * cos(v.A! / 2),
      ),
      rule(
        'q = 2s sin(A/2)',
        '{q} = 2 × {s} × sin({A} ÷ 2)',
        {
          q: [
            (v) => 2 * v.s! * sin(v.A! / 2),
            '2 × {s} × sin({A} ÷ 2)',
            'Half of BD is the side times sin of half of A.',
          ],
        },
        (v) => v.q! - 2 * v.s! * sin(v.A! / 2),
      ),
    ],
    example: { s: 5, A: 74, p: 10 * cos(37), q: 10 * sin(37) },
    startWith: ['s', 'A'],
    representation: {
      kind: 'markedFigure',
      quadrilateral: {
        family: 'rhombus',
        width: 's',
        angle: 'A',
        diagonals: true,
        labels: { AC: 'p', BD: 'q' },
      },
    },
  }),
  figureDemo({
    id: 'g.m10-quadrilaterals-square',
    title: 'Square and its diagonal',
    use: 'Use this for “A square has side 4. How long is its diagonal?”',
    assumptions: ['Four equal sides and four right angles.', 'The diagonal is the side times √2.'],
    variables: [side('s', 'Side s'), side('d', 'Diagonal d', 150)],
    rules: [
      rule(
        'd = s√2',
        '{d} = {s} × √2',
        {
          d: [(v) => v.s! * Math.SQRT2, '{s} × √2', 'The diagonal of a square is a side times √2.'],
          s: [(v) => v.d! / Math.SQRT2, '{d} ÷ √2', 'Divide the diagonal by √2.'],
        },
        (v) => v.d! - v.s! * Math.SQRT2,
      ),
    ],
    example: { s: 4, d: 4 * Math.SQRT2 },
    startWith: ['s'],
    representation: {
      kind: 'markedFigure',
      quadrilateral: { family: 'square', width: 's', diagonals: true, labels: { AC: 'd' } },
    },
  }),
  figureDemo({
    id: 'g.m10-quadrilaterals-trapezoid',
    title: 'Trapezoid',
    use: 'Use this for “A trapezoid has bases 10 and 6 and height 4. Find its area.”',
    assumptions: ['One pair of parallel sides, the bases AB and DC.', 'Area = (b₁ + b₂) ÷ 2 × h.'],
    variables: [
      side('w', 'Base b₁ (AB)'),
      side('t', 'Base b₂ (DC)'),
      side('h', 'Height h'),
      angle('A', 'Angle A'),
      der(side('K', 'Area K', 10000)),
    ],
    rules: [
      rule(
        'K = (b₁ + b₂)h/2',
        '{K} = ({w} + {t}) ÷ 2 × {h}',
        {
          K: [
            (v) => ((v.w! + v.t!) / 2) * v.h!,
            '({w} + {t}) ÷ 2 × {h}',
            'The mean of the bases times the height.',
          ],
        },
        (v) => v.K! - ((v.w! + v.t!) / 2) * v.h!,
      ),
    ],
    // Isosceles: the top sits centered, so the legs lean at atan(4 ÷ 2) ≈ 63.43°.
    example: { w: 10, t: 6, h: 4, A: atanDeg(2), K: 32 },
    startWith: ['w', 't', 'h', 'A'],
    standalone: {
      vars: ['A'],
      why: 'The angle at A sets the lean; the area needs only the bases and height.',
    },
    representation: {
      kind: 'markedFigure',
      quadrilateral: {
        family: 'trapezoid',
        width: 'w',
        top: 't',
        height: 'h',
        angle: 'A',
        labels: { AB: 'w', DC: 't' },
      },
    },
  }),
  figureDemo({
    id: 'g.m10-quadrilaterals-kite',
    title: 'Kite',
    use: 'Use this for “A kite’s diagonals are 8 and 9, the short part 3. How long are its short sides?”',
    assumptions: [
      'Two pairs of equal sides next to each other: AB = AD and CB = CD.',
      'The diagonals meet at right angles and the long one cuts the short one in half.',
    ],
    variables: [
      side('w', 'Diagonal BD'),
      side('u', 'OA'),
      side('l', 'OC'),
      der(side('s', 'Side AB')),
    ],
    rules: [
      rule(
        's² = (w/2)² + u²',
        '{s}² = ({w} ÷ 2)² + {u}²',
        {
          s: [
            (v) => Math.hypot(v.w! / 2, v.u!),
            '√(({w} ÷ 2)² + {u}²)',
            'AB is the hypotenuse of the right triangle AOB.',
          ],
        },
        (v) => v.s! ** 2 - (v.w! / 2) ** 2 - v.u! ** 2,
      ),
    ],
    example: { w: 8, u: 3, l: 6, s: 5 },
    startWith: ['w', 'u', 'l'],
    standalone: { vars: ['l'], why: 'The long part of the diagonal sets the other pair of sides.' },
    representation: {
      kind: 'markedFigure',
      quadrilateral: {
        family: 'kite',
        width: 'w',
        height: 'u',
        top: 'l',
        diagonals: true,
        labels: { AB: 's' },
      },
    },
  }),
  // A construction from named points.
  figureDemo({
    id: 'g.m10-constructions-perpendicular-bisector',
    title: 'Construct a perpendicular bisector',
    use: 'Use this for “Construct the perpendicular bisector of a 6 cm segment with a compass set to 4 cm.”',
    assumptions: [
      'Set the compass wider than half of AB; draw a circle about A and one about B.',
      'The circles cross at P, the same distance r from A and B; the line through P at right angles to AB bisects it at M.',
      'P is h above M: h² + (AB ÷ 2)² = r².',
    ],
    variables: [
      side('ab', 'Segment AB'),
      side('r', 'Compass r'),
      der(side('m', 'AM')),
      der(side('h', 'MP')),
    ],
    rules: [
      rule(
        'm = AB/2',
        '{m} = {ab} ÷ 2',
        { m: [(v) => v.ab! / 2, '{ab} ÷ 2', 'M is the middle of AB.'] },
        (v) => v.m! - v.ab! / 2,
      ),
      rule(
        'h² = r² − m²',
        '{h}² = {r}² − {m}²',
        {
          h: [
            (v) => root(v.r! ** 2 - v.m! ** 2),
            '√({r}² − {m}²)',
            'The right triangle AMP: r is its hypotenuse.',
          ],
        },
        (v) => v.h! ** 2 - v.r! ** 2 + v.m! ** 2,
      ),
    ],
    example: { ab: 6, r: 4, m: 3, h: Math.sqrt(7) },
    startWith: ['ab', 'r'],
    representation: {
      kind: 'markedFigure',
      points: { A: [0, 0], B: ['ab', 0], M: ['m', 0], P: ['m', 'h'] },
      parts: [
        { circle: 'A', through: 'P', dashed: true },
        { circle: 'B', through: 'P', dashed: true },
        { segment: 'AB' },
        { segment: 'AP', dashed: true },
        { segment: 'BP', dashed: true },
        { line: 'MP' },
        { ticks: 'AM', count: 1 },
        { ticks: 'MB', count: 1 },
        { ticks: 'AP', count: 2 },
        { ticks: 'BP', count: 2 },
        { right: 'PMB' },
        { label: 'AB', value: 'ab', inCaption: true },
        { label: 'MP', value: 'h', inCaption: true },
        { label: 'AP', value: 'r' },
      ],
    },
  }),
  // A proof, step by step.
  figureDemo({
    id: 'g.m10-proofs-isosceles',
    title: 'Proof: base angles of an isosceles triangle',
    use: 'Use this for “Given AB = AC, prove ∠B = ∠C.”',
    assumptions: [
      'Given: AB = AC. Draw AD, the bisector of ∠A, to meet BC at D.',
      'Step through the proof: each step lights what it uses and what it proves.',
      'The base angles: B = (180° − A) ÷ 2.',
    ],
    variables: [
      side('s', 'Legs AB = AC'),
      angle('A', 'Angle A'),
      der(angle('B', 'Angle B')),
      der(side('half', 'BD')),
      der(side('ht', 'AD')),
      der(side('b', 'Base BC')),
      { id: 'k', symbol: 'k', name: 'Proof step', min: 1, max: 5, integer: true },
    ],
    rules: [
      rule(
        'B = (180° − A)/2',
        '{B} = (180 − {A}) ÷ 2',
        {
          B: [
            (v) => (180 - v.A!) / 2,
            '(180 − {A}) ÷ 2',
            'The two base angles share what is left of 180°.',
          ],
        },
        (v) => v.B! - (180 - v.A!) / 2,
      ),
      rule(
        'BD = s sin(A/2)',
        '{half} = {s} × sin({A} ÷ 2)',
        {
          half: [
            (v) => v.s! * sin(v.A! / 2),
            '{s} × sin({A} ÷ 2)',
            'In the right triangle ABD, BD is across from half of A.',
          ],
        },
        (v) => v.half! - v.s! * sin(v.A! / 2),
      ),
      rule(
        'AD = s cos(A/2)',
        '{ht} = {s} × cos({A} ÷ 2)',
        { ht: [(v) => v.s! * cos(v.A! / 2), '{s} × cos({A} ÷ 2)', 'AD is next to half of A.'] },
        (v) => v.ht! - v.s! * cos(v.A! / 2),
      ),
      rule(
        'BC = 2BD',
        '{b} = 2 × {half}',
        { b: [(v) => 2 * v.half!, '2 × {half}', 'D is the middle of BC.'] },
        (v) => v.b! - 2 * v.half!,
      ),
    ],
    example: { s: 6, A: 40, B: 70, half: 6 * sin(20), ht: 6 * cos(20), b: 12 * sin(20), k: 1 },
    startWith: ['s', 'A', 'k'],
    standalone: { vars: ['k'], why: 'The proof step only picks what the figure lights.' },
    representation: {
      kind: 'markedFigure',
      points: { B: [0, 0], C: ['b', 0], D: ['half', 0], A: ['half', 'ht'] },
      parts: [
        { segment: 'AB' },
        { segment: 'AC' },
        { segment: 'BC' },
        { segment: 'AD' },
        { ticks: 'AB', count: 1 },
        { ticks: 'AC', count: 1 },
        { arcs: 'BAD', count: 1 },
        { arcs: 'DAC', count: 1 },
        { label: 'ABD', value: 'B' },
      ],
      proof: {
        step: 'k',
        steps: [
          { given: ['AB', 'AC'], proved: [], text: 'AB = AC (given).' },
          { given: ['BAD', 'DAC'], proved: [], text: 'AD bisects ∠A, so ∠BAD = ∠DAC (given).' },
          { given: [], proved: ['AD'], text: 'AD = AD (the same segment).' },
          {
            given: ['AB', 'AC', 'BAD', 'DAC', 'AD'],
            proved: ['△ABD', '△ACD'],
            text: '△ABD ≅ △ACD (SAS).',
          },
          {
            given: ['△ABD', '△ACD'],
            proved: ['ABD', 'ACD'],
            text: '∠B = ∠C: matching parts of congruent triangles are equal.',
          },
        ],
      },
    },
  }),
];

// ─── H12 circleTheorems ───────────────────────────────────────────────────────

/** x × y = z × w, solved for any one of the four. */
const products = (x: string, y: string, z: string, w: string, how: string) =>
  rule(
    `${x}${y} = ${z}${w}`,
    `{${x}} × {${y}} = {${z}} × {${w}}`,
    {
      [x]: [(v) => (v[z]! * v[w]!) / v[y]!, `{${z}} × {${w}} ÷ {${y}}`, how],
      [y]: [(v) => (v[z]! * v[w]!) / v[x]!, `{${z}} × {${w}} ÷ {${x}}`, how],
      [z]: [(v) => (v[x]! * v[y]!) / v[w]!, `{${x}} × {${y}} ÷ {${w}}`, how],
      [w]: [(v) => (v[x]! * v[y]!) / v[z]!, `{${x}} × {${y}} ÷ {${z}}`, how],
    },
    (v) => v[x]! * v[y]! - v[z]! * v[w]!,
  );
const halfArc = rule(
  'i = c/2',
  '{i} = {c} ÷ 2',
  {
    i: [(v) => v.c! / 2, '{c} ÷ 2', 'An inscribed angle is half the central angle on its arc.'],
    c: [(v) => 2 * v.i!, '2 × {i}', 'The arc (central angle) is twice the inscribed angle.'],
  },
  (v) => v.i! - v.c! / 2,
);
const inscribedDemo = (id: string, title: string, use: string, c: number, start: string) =>
  figureDemo({
    id,
    title,
    use,
    assumptions: [
      'A central angle has its vertex at the center O; it measures its arc AB.',
      'An inscribed angle has its vertex P on the circle and stands on the same arc: it is half the central angle.',
      'Every inscribed angle on the arc is the same, wherever P sits on the other arc.',
    ],
    variables: [
      angle('c', 'Central angle (arc AB)', 'c', 359),
      angle('i', 'Inscribed angle APB', 'i', 179.5),
    ],
    rules: [halfArc],
    example: { c, i: c / 2 },
    startWith: [start],
    representation: { kind: 'circleTheorems', theorem: 'inscribed', central: 'c', inscribed: 'i' },
  });

const CIRCLE_DEMOS: ModuleDef[] = [
  inscribedDemo(
    'g.m10-circle-theorems-inscribed',
    'Inscribed and central angles',
    'Use this for “The central angle AOB is 100°. Find the inscribed angle APB.”',
    100,
    'c',
  ),
  inscribedDemo(
    'g.m10-circle-theorems-inscribed-major',
    'An inscribed angle on a major arc',
    'Use this for “An inscribed angle is 125°. How big is its arc?”',
    250,
    'i',
  ),
  figureDemo({
    id: 'g.m10-circle-theorems-semicircle',
    title: 'The angle in a semicircle',
    use: 'Use this for “AB is a diameter and ∠PAB = 35°. Find ∠PBA.”',
    assumptions: [
      'AB is a diameter, so the arc it cuts off is 180°.',
      'The inscribed angle at P is half of 180°: a right angle.',
      'The other two angles of triangle APB add to 90°.',
    ],
    variables: [angle('a', 'Angle at A', 'a', 89), angle('b', 'Angle at B', 'b', 89)],
    rules: [
      rule(
        'a + b = 90°',
        '{a} + {b} = 90',
        {
          a: [(v) => 90 - v.b!, '90 − {b}', 'The angle at P is 90°, so the other two share 90°.'],
          b: [(v) => 90 - v.a!, '90 − {a}', 'The angle at P is 90°, so the other two share 90°.'],
        },
        (v) => v.a! + v.b! - 90,
      ),
    ],
    example: { a: 35, b: 55 },
    startWith: ['a'],
    representation: { kind: 'circleTheorems', theorem: 'semicircle', angle: 'a', other: 'b' },
  }),
  figureDemo({
    id: 'g.m10-circle-theorems-tangent',
    title: 'A tangent and its radius',
    use: 'Use this for “The radius is 5 and the tangent from P is 12. How far is P from the center?”',
    assumptions: [
      'A tangent touches the circle at one point T, at right angles to the radius OT.',
      'So O, T and P make a right triangle: r² + t² = d².',
    ],
    variables: [side('r', 'Radius r'), side('t', 'Tangent PT'), side('d', 'Distance OP', 150)],
    rules: [
      rule(
        'r² + t² = d²',
        '{r}² + {t}² = {d}²',
        {
          d: [
            (v) => Math.hypot(v.r!, v.t!),
            '√({r}² + {t}²)',
            'OP is the hypotenuse of the right triangle OTP.',
          ],
          t: [
            (v) => root(v.d! ** 2 - v.r! ** 2),
            '√({d}² − {r}²)',
            'Take r² from d², then the square root.',
          ],
          r: [
            (v) => root(v.d! ** 2 - v.t! ** 2),
            '√({d}² − {t}²)',
            'Take t² from d², then the square root.',
          ],
        },
        (v) => v.r! ** 2 + v.t! ** 2 - v.d! ** 2,
      ),
    ],
    example: { r: 5, t: 12, d: 13 },
    startWith: ['r', 't'],
    representation: {
      kind: 'circleTheorems',
      theorem: 'tangent',
      radius: 'r',
      tangent: 't',
      distance: 'd',
    },
  }),
  figureDemo({
    id: 'g.m10-circle-theorems-chords',
    title: 'Two chords crossing',
    use: 'Use this for “Chords AB and CD cross at E; AE = 4, EB = 6, CE = 3. Find ED.”',
    assumptions: [
      'Two chords cross at E inside the circle.',
      'The products of the parts of each chord are equal: AE × EB = CE × ED.',
    ],
    variables: [side('a', 'AE'), side('b', 'EB'), side('c', 'CE'), side('d', 'ED', 10000)],
    rules: [
      products('a', 'b', 'c', 'd', 'Crossing chords: the products of their parts are equal.'),
    ],
    example: { a: 4, b: 6, c: 3, d: 8 },
    startWith: ['a', 'b', 'c'],
    representation: { kind: 'circleTheorems', theorem: 'chords', segments: ['a', 'b', 'c', 'd'] },
  }),
  figureDemo({
    id: 'g.m10-circle-theorems-secants',
    title: 'Two secants from a point',
    use: 'Use this for “From P, PA = 4 and PB = 9 on one secant, PC = 3 on the other. Find PD.”',
    assumptions: [
      'Two secants from P outside the circle: PA and PC are the outside parts, PB and PD the whole secants.',
      'Outside part × whole secant is the same for both: PA × PB = PC × PD.',
    ],
    variables: [
      side('a', 'PA (outside)'),
      side('b', 'PB (whole)'),
      side('c', 'PC (outside)'),
      side('d', 'PD (whole)', 10000),
    ],
    rules: [
      products(
        'a',
        'b',
        'c',
        'd',
        'Two secants from one point: outside part × whole secant is equal.',
      ),
    ],
    example: { a: 4, b: 9, c: 3, d: 12 },
    startWith: ['a', 'b', 'c'],
    representation: { kind: 'circleTheorems', theorem: 'secants', segments: ['a', 'b', 'c', 'd'] },
  }),
  figureDemo({
    id: 'g.m10-circle-theorems-secant-tangent',
    title: 'A tangent and a secant from a point',
    use: 'Use this for “From P, the tangent PT = 6 and PA = 4 on a secant. Find PB.”',
    assumptions: [
      'From P, a tangent touches the circle at T and a secant crosses it at A and B.',
      'The tangent squared is outside part × whole secant: PT² = PA × PB.',
    ],
    variables: [
      side('t', 'PT (tangent)'),
      side('a', 'PA (outside)'),
      side('b', 'PB (whole)', 10000),
    ],
    rules: [
      rule(
        't² = ab',
        '{t}² = {a} × {b}',
        {
          t: [
            (v) => root(v.a! * v.b!),
            '√({a} × {b})',
            'The tangent is the square root of outside part × whole secant.',
          ],
          b: [
            (v) => v.t! ** 2 / v.a!,
            '{t}² ÷ {a}',
            'The whole secant is the tangent squared over the outside part.',
          ],
          a: [
            (v) => v.t! ** 2 / v.b!,
            '{t}² ÷ {b}',
            'The outside part is the tangent squared over the whole secant.',
          ],
        },
        (v) => v.t! ** 2 - v.a! * v.b!,
      ),
    ],
    example: { t: 6, a: 4, b: 9 },
    startWith: ['t', 'a'],
    representation: { kind: 'circleTheorems', theorem: 'secantTangent', segments: ['t', 'a', 'b'] },
  }),
];

export const HSC_GALLERY_MODULES: ModuleDef[] = [
  ...TRIANGLE_DEMOS,
  ...FIGURE_DEMOS,
  ...CIRCLE_DEMOS,
];

export const HSC_GALLERY_LAYOUTS: LayoutDef[] = [];
