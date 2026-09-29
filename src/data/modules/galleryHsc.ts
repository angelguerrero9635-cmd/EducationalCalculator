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

export const HSC_GALLERY_MODULES: ModuleDef[] = [
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

export const HSC_GALLERY_LAYOUTS: LayoutDef[] = [];
