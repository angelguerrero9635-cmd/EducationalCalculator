/**
 * Grade 10 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md, docs/build/m.10.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/math10.ts`.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { ModuleDef, StepText } from '../types';

// ─── Helpers only Grade 10 uses ──────────────────────────────────────────────

const RAD = Math.PI / 180;
const sin = (d: number) => Math.sin(d * RAD);
const cos = (d: number) => Math.cos(d * RAD);
const tan = (d: number) => Math.tan(d * RAD);
/** Inverse sine, cosine and tangent in degrees (undefined outside −1 to 1). */
const asinD = (x: number) =>
  Math.abs(x) <= 1 + 1e-12 ? Math.asin(Math.max(-1, Math.min(1, x))) / RAD : undefined;
const acosD = (x: number) =>
  Math.abs(x) <= 1 + 1e-12 ? Math.acos(Math.max(-1, Math.min(1, x))) / RAD : undefined;
const atanD = (x: number) => Math.atan(x) / RAD;
/** A square root that refuses a negative (the solver reports the conflict). */
const root = (x: number) => (x >= -1e-12 ? Math.sqrt(Math.max(0, x)) : undefined);
/** Rounded to 12 significant figures, so 0.1 + 0.2 is 0.3 when a value is worked out. */
const exact = (x: number | undefined) =>
  x === undefined || !Number.isFinite(x) ? undefined : Number(x.toPrecision(12));
const quot = (a: number, b: number) => (b === 0 ? undefined : a / b);

/** A value with a range. */
const num = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, min, max, ...extra });
/** A length (any positive size). */
const len = (id: string, symbol: string, name: string, max = 1000, extra = {}) =>
  num(id, symbol, name, 0.01, max, extra);
/** An angle in degrees. */
const deg = (id: string, symbol: string, name: string, min = 0.1, max = 179.9, extra = {}) =>
  num(id, symbol, name, min, max, { unit: '°', ...extra });
/** A value worked out, never typed. */
const der = (v: VariableDef): VariableDef => ({ ...v, derived: true });

/** One rule with its step text: for each value it is solved for, [solve, expr, how]. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}
type Solver = (v: Values) => number | number[] | undefined;
function rule(
  id: string,
  display: string,
  solve: Record<string, [Solver, StepText['expr'], StepText['how']]>,
  residual: (v: Values) => number,
  extra: Partial<Relation> = {},
): Rule {
  const vars = [...new Set([...display.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))];
  const fix = (f: Solver) => (v: Values) => {
    const y = f(v);
    return Array.isArray(y) ? y.map((x) => exact(x)!) : exact(y);
  };
  return {
    relation: {
      id,
      display,
      vars,
      residual,
      // A value the rule isn't solved for here is never solved backwards by search.
      solve: Object.fromEntries(
        vars.map((x) => [x, solve[x] ? fix(solve[x][0]) : () => undefined]),
      ),
      ...extra,
    },
    steps: Object.fromEntries(
      Object.entries(solve).map(([k, [, expr, how]]) => [k, { expr, how }]),
    ),
  };
}
/** `x` worked out from the others only. */
const derive = (
  id: string,
  display: string,
  x: string,
  f: (v: Values) => number | undefined,
  expr: string,
  how: string,
) => rule(id, display, { [x]: [f, expr, how] }, (v) => v[x]! - (f(v) ?? NaN));
/** A check that only rejects values (a triangle that doesn't close). */
const limit = (
  id: string,
  display: string,
  ok: (v: Values) => boolean,
  message?: string,
): Rule => ({
  relation: {
    id,
    display,
    constraint: true,
    vars: [...new Set([...display.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))],
    residual: (v: Values) => (ok(v) ? 0 : 1),
    solve: {},
    ...(message ? { message: (v: Values) => (ok(v) ? undefined : message) } : {}),
  },
  steps: {},
});
/** A page from its rules. */
function page(d: Omit<ModuleDef, 'relations' | 'steps'> & { rules: Rule[] }): ModuleDef {
  const { rules, ...rest } = d;
  return {
    ...rest,
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}
/** x² + y² = z², solved for any one. */
const pythagoras = (x: string, y: string, z: string, why: string) =>
  rule(
    `${x}² + ${y}² = ${z}²`,
    `{${x}}² + {${y}}² = {${z}}²`,
    {
      [z]: [(v) => Math.hypot(v[x]!, v[y]!), `√({${x}}² + {${y}}²)`, why],
      [x]: [(v) => root(v[z]! ** 2 - v[y]! ** 2), `√({${z}}² − {${y}}²)`, why],
      [y]: [(v) => root(v[z]! ** 2 - v[x]! ** 2), `√({${z}}² − {${x}}²)`, why],
    },
    (v) => v[x]! ** 2 + v[y]! ** 2 - v[z]! ** 2,
  );
/** f(A) = x ÷ y for sin, cos or tan of an acute angle A, solved for any one. */
function ratio(
  fn: 'sin' | 'cos' | 'tan',
  A: string,
  x: string,
  y: string,
  names: [string, string],
) {
  const f = { sin, cos, tan }[fn];
  const inv = { sin: asinD, cos: acosD, tan: atanD }[fn];
  const [top, bottom] = names;
  return rule(
    `${fn} ${A} = ${x}/${y}`,
    `${fn}({${A}}) = {${x}} ÷ {${y}}`,
    {
      [x]: [(v) => v[y]! * f(v[A]!), `{${y}} × ${fn}({${A}})`, `${top} = ${bottom} × ${fn} ${A}.`],
      [y]: [
        (v) => quot(v[x]!, f(v[A]!)),
        `{${x}} ÷ ${fn}({${A}})`,
        `${bottom} = ${top} ÷ ${fn} ${A}.`,
      ],
      [A]: [
        (v) => inv(v[x]! / v[y]!),
        `${fn}⁻¹({${x}} ÷ {${y}})`,
        `The inverse ${{ sin: 'sine', cos: 'cosine', tan: 'tangent' }[fn]} turns the ratio back into the angle.`,
      ],
    },
    (v) => f(v[A]!) * v[y]! - v[x]!,
  );
}
/** c = k × a (or k² × a for an area): a length of the copy, solved for any one. */
const scaled = (c: string, k: string, a: string, what: string, square = false) =>
  square
    ? rule(
        `${c} = ${k}² × ${a}`,
        `{${c}} = {${k}}² × {${a}}`,
        {
          [c]: [(v) => v[k]! ** 2 * v[a]!, `{${k}}² × {${a}}`, 'Every area is multiplied by k².'],
          [k]: [
            (v) => root(quot(v[c]!, v[a]!) ?? NaN),
            `√({${c}} ÷ {${a}})`,
            'The scale factor is the square root of the area ratio.',
          ],
          [a]: [(v) => quot(v[c]!, v[k]! ** 2), `{${c}} ÷ {${k}}²`, `Undo k² on the ${what}.`],
        },
        (v) => v[c]! - v[k]! ** 2 * v[a]!,
      )
    : rule(
        `${c} = ${k} × ${a}`,
        `{${c}} = {${k}} × {${a}}`,
        {
          [c]: [
            (v) => v[k]! * v[a]!,
            `{${k}} × {${a}}`,
            `Multiply the ${what} by the scale factor.`,
          ],
          [k]: [
            (v) => quot(v[c]!, v[a]!),
            `{${c}} ÷ {${a}}`,
            `The image’s ${what} over the original’s.`,
          ],
          [a]: [
            (v) => quot(v[c]!, v[k]!),
            `{${c}} ÷ {${k}}`,
            `Undo the scale factor on the ${what}.`,
          ],
        },
        (v) => v[c]! - v[k]! * v[a]!,
      );
/** c = a + b, solved for any one. */
const sum = (c: string, a: string, b: string, how: string) =>
  rule(
    `${c} = ${a} + ${b}`,
    `{${c}} = {${a}} + {${b}}`,
    {
      [c]: [(v) => v[a]! + v[b]!, `{${a}} + {${b}}`, how],
      [a]: [(v) => v[c]! - v[b]!, `{${c}} − {${b}}`, how],
      [b]: [(v) => v[c]! - v[a]!, `{${c}} − {${a}}`, how],
    },
    (v) => v[c]! - v[a]! - v[b]!,
  );
/** x × y = z × w, solved for any one. */
const products = (x: string, y: string, z: string, w: string, how: string) =>
  rule(
    `${x}${y} = ${z}${w}`,
    `{${x}} × {${y}} = {${z}} × {${w}}`,
    {
      [x]: [(v) => quot(v[z]! * v[w]!, v[y]!), `{${z}} × {${w}} ÷ {${y}}`, how],
      [y]: [(v) => quot(v[z]! * v[w]!, v[x]!), `{${z}} × {${w}} ÷ {${x}}`, how],
      [z]: [(v) => quot(v[x]! * v[y]!, v[w]!), `{${x}} × {${y}} ÷ {${w}}`, how],
      [w]: [(v) => quot(v[x]! * v[y]!, v[z]!), `{${x}} × {${y}} ÷ {${z}}`, how],
    },
    (v) => v[x]! * v[y]! - v[z]! * v[w]!,
  );
/** The three sides x, y, z close into a triangle. */
const closes = (x: string, y: string, z: string) =>
  limit(
    'the sides close into a triangle',
    `{${x}}, {${y}} and {${z}} close into a triangle`,
    (v) => 2 * Math.max(v[x]!, v[y]!, v[z]!) < v[x]! + v[y]! + v[z]!,
    'Each side must be shorter than the other two together, or the sides don’t meet.',
  );

// ─── m.10.right-triangle-trig ────────────────────────────────────────────────

const TRIG: ModuleDef[] = [
  page({
    id: 'm.10.right-triangle-trig',
    assumptions: [
      'The right angle is at C. From angle A: a is the opposite side, b the adjacent side, c the hypotenuse.',
      'sin A = opposite ÷ hypotenuse, cos A = adjacent ÷ hypotenuse, tan A = opposite ÷ adjacent.',
      'The ratios depend only on the angle, not on the triangle’s size.',
    ],
    variables: [
      len('a', 'a', 'Opposite side a', 10000),
      len('b', 'b', 'Adjacent side b', 10000),
      len('c', 'c', 'Hypotenuse c', 15000),
      deg('A', 'A', 'Angle A', 0.01, 89.99),
      der(num('s', 'sin A', 'Sine of A', 0, 1)),
      der(num('k', 'cos A', 'Cosine of A', 0, 1)),
      der(num('t', 'tan A', 'Tangent of A', 0, 1e6)),
    ],
    rules: [
      pythagoras('a', 'b', 'c', 'The legs and the hypotenuse of a right triangle: a² + b² = c².'),
      ratio('tan', 'A', 'a', 'b', ['Opposite', 'adjacent']),
      ratio('sin', 'A', 'a', 'c', ['Opposite', 'hypotenuse']),
      ratio('cos', 'A', 'b', 'c', ['Adjacent', 'hypotenuse']),
      derive(
        'sin A = a ÷ c',
        '{s} = {a} ÷ {c}',
        's',
        (v) => quot(v.a!, v.c!),
        '{a} ÷ {c}',
        'Sine: the opposite side over the hypotenuse.',
      ),
      derive(
        'cos A = b ÷ c',
        '{k} = {b} ÷ {c}',
        'k',
        (v) => quot(v.b!, v.c!),
        '{b} ÷ {c}',
        'Cosine: the adjacent side over the hypotenuse.',
      ),
      derive(
        'tan A = a ÷ b',
        '{t} = {a} ÷ {b}',
        't',
        (v) => quot(v.a!, v.b!),
        '{a} ÷ {b}',
        'Tangent: the opposite side over the adjacent side.',
      ),
    ],
    example: { a: 5, b: 12, c: 13, A: atanD(5 / 12), s: 5 / 13, k: 12 / 13, t: 5 / 12 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'triangleSolver',
      parts: { a: 'a', b: 'b', c: 'c', A: 'A', C: 90 },
      trig: { angle: 'A' },
    },
  }),
  page({
    id: 'm.10.right-triangle-trig~find-side',
    title: 'Find a side from an angle',
    use: 'Use this for “A 25 ft ladder leans at 38° to the ground. How high up the wall does it reach?”',
    assumptions: [
      'The wall is straight up from level ground, so the right angle is at its foot.',
      'The ladder is the hypotenuse; the height is opposite the angle A, the foot distance adjacent.',
      'Multiply the hypotenuse by sin A for the opposite side, by cos A for the adjacent side.',
    ],
    variables: [
      deg('A', 'A', 'Angle with the ground', 0.01, 89.99),
      len('o', 'o', 'Height up the wall', 10000, { unit: 'ft' }),
      len('h', 'h', 'Ladder length', 10000, { unit: 'ft' }),
      len('b', 'b', 'Foot from the wall', 10000, { unit: 'ft' }),
    ],
    rules: [
      ratio('sin', 'A', 'o', 'h', ['Opposite', 'hypotenuse']),
      ratio('cos', 'A', 'b', 'h', ['Adjacent', 'hypotenuse']),
      pythagoras('o', 'b', 'h', 'The ladder is the hypotenuse of a right triangle.'),
    ],
    example: { A: 38, h: 25, o: 25 * sin(38), b: 25 * cos(38) },
    startWith: ['A', 'h'],
    equation: 'sin({A}°) = {o}/{h}',
    representation: {
      kind: 'triangleSolver',
      parts: { a: 'o', b: 'b', c: 'h', A: 'A', C: 90 },
      trig: { angle: 'A' },
      scene: { kind: 'ladder' },
    },
  }),
  page({
    id: 'm.10.right-triangle-trig~find-angle',
    title: 'Find an angle from two sides',
    use: 'Use this for “A ramp rises 2 ft over a run of 24 ft. What angle does it make with the ground?”',
    assumptions: [
      'The rise is opposite the angle A and the run is adjacent to it, so tan A = rise ÷ run.',
      'The inverse tangent, tan⁻¹, turns the ratio back into the angle.',
      'Set the calculator to degrees.',
    ],
    variables: [
      deg('A', 'A', 'Ramp angle', 0.01, 89.99),
      len('o', 'o', 'Rise', 10000, { unit: 'ft' }),
      len('r', 'r', 'Run', 10000, { unit: 'ft' }),
    ],
    rules: [ratio('tan', 'A', 'o', 'r', ['Opposite', 'adjacent'])],
    example: { o: 2, r: 24, A: atanD(2 / 24) },
    startWith: ['o', 'r'],
    equation: 'tan({A}°) = {o}/{r}',
    representation: {
      kind: 'triangleSolver',
      parts: { a: 'o', b: 'r', A: 'A', C: 90 },
      trig: { angle: 'A' },
      scene: { kind: 'ramp' },
    },
  }),
  page({
    id: 'm.10.right-triangle-trig~elevation',
    title: 'Angle of elevation',
    use: 'Use this for “From 120 ft away, the angle of elevation to the top of a tree is 28°. How tall is the tree?”',
    assumptions: [
      'The angle of elevation is measured up from a level line through the eye.',
      'The height above the eye is opposite the angle: distance × tan A.',
      'Add the eye height for the whole height; use 0 when the angle is measured at the ground.',
    ],
    variables: [
      len('d', 'd', 'Distance along the ground', 10000, { unit: 'ft', min: 0.1 }),
      deg('A', 'A', 'Angle of elevation', 0.01, 89.99),
      num('e', 'e', 'Eye height', 0, 10, { unit: 'ft' }),
      len('u', 'u', 'Height above the eye', 1e6, { unit: 'ft' }),
      len('H', 'H', 'Height of the top', 1e6, { unit: 'ft' }),
    ],
    rules: [
      ratio('tan', 'A', 'u', 'd', ['Opposite', 'adjacent']),
      rule(
        'H = u + e',
        '{H} = {u} + {e}',
        {
          H: [(v) => v.u! + v.e!, '{u} + {e}', 'Add the eye height to the height above the eye.'],
          u: [(v) => v.H! - v.e!, '{H} − {e}', 'Take the eye height off the whole height.'],
          e: [(v) => v.H! - v.u!, '{H} − {u}', 'The eye height is what is left.'],
        },
        (v) => v.H! - v.u! - v.e!,
      ),
    ],
    example: { d: 120, A: 28, e: 5, u: 120 * tan(28), H: 120 * tan(28) + 5 },
    startWith: ['d', 'A', 'e'],
    representation: {
      kind: 'triangleSolver',
      parts: { a: 'u', b: 'd', A: 'A', C: 90 },
      trig: { angle: 'A' },
      scene: { kind: 'sight', eye: 'e' },
    },
  }),
  page({
    id: 'm.10.right-triangle-trig~complement',
    title: 'Sine and cosine of complementary angles',
    use: 'Use this for “sin 28° is about 0.4695. Which cosine is equal to it?”',
    assumptions: [
      'The two acute angles of a right triangle add to 90°: they are complementary.',
      'The side opposite A is adjacent to B, so sin A = cos B = cos(90° − A).',
      'With a hypotenuse of 1, the side opposite A is sin A.',
    ],
    variables: [
      deg('A', 'A', 'Angle A', 0.01, 89.99),
      deg('B', 'B', 'Angle B', 0.01, 89.99),
      num('s', 'sin A', 'Sine of A', 0.0001, 1),
      num('k', 'cos B', 'Cosine of B', 0.0001, 1),
    ],
    rules: [
      rule(
        'B = 90° − A',
        '{B} = 90 − {A}',
        {
          B: [(v) => 90 - v.A!, '90 − {A}', 'The acute angles of a right triangle add to 90°.'],
          A: [(v) => 90 - v.B!, '90 − {B}', 'The acute angles of a right triangle add to 90°.'],
        },
        (v) => v.B! - (90 - v.A!),
      ),
      rule(
        's = sin A',
        '{s} = sin({A})',
        {
          s: [
            (v) => sin(v.A!),
            'sin({A})',
            'The sine of A: the side opposite A over the hypotenuse.',
          ],
          A: [
            (v) => asinD(v.s!),
            'sin⁻¹({s})',
            'The inverse sine turns the sine back into the angle.',
          ],
        },
        (v) => v.s! - sin(v.A!),
      ),
      rule(
        'k = cos B',
        '{k} = cos({B})',
        {
          k: [
            (v) => cos(v.B!),
            'cos({B})',
            'The cosine of B: the side next to B over the hypotenuse.',
          ],
          B: [
            (v) => acosD(v.k!),
            'cos⁻¹({k})',
            'The inverse cosine turns the cosine back into the angle.',
          ],
        },
        (v) => v.k! - cos(v.B!),
      ),
    ],
    example: { A: 28, B: 62, s: sin(28), k: cos(62) },
    startWith: ['A'],
    representation: {
      kind: 'triangleSolver',
      parts: { a: 's', c: 1, A: 'A', B: 'B', C: 90 },
      trig: { angle: 'A' },
    },
  }),
];

// ─── m.10.similarity ─────────────────────────────────────────────────────────

const SIMILARITY: ModuleDef[] = [
  page({
    id: 'm.10.similarity',
    assumptions: [
      'Similar triangles have equal angles, and every side of △DEF is k times its match in △ABC.',
      'The scale factor k is a side of △DEF over the matching side of △ABC.',
      'Match the sides in order: d with a, e with b, f with c.',
    ],
    variables: [
      len('a', 'a', 'Side a (BC)'),
      len('b', 'b', 'Side b (CA)'),
      len('c', 'c', 'Side c (AB)'),
      num('k', 'k', 'Scale factor', 0.01, 100),
      len('d', 'd', 'Side d (EF)', 100000),
      len('e', 'e', 'Side e (FD)', 100000),
      len('f', 'f', 'Side f (DE)', 100000),
    ],
    rules: [
      closes('a', 'b', 'c'),
      scaled('d', 'k', 'a', 'side'),
      scaled('e', 'k', 'b', 'side'),
      scaled('f', 'k', 'c', 'side'),
    ],
    example: { a: 5, b: 6, c: 8, k: 1.5, d: 7.5, e: 9, f: 12 },
    startWith: ['a', 'b', 'c', 'k'],
    representation: {
      kind: 'triangleSolver',
      parts: { a: 'a', b: 'b', c: 'c' },
      similar: { scale: 'k', sides: { a: 'd', b: 'e', c: 'f' } },
    },
  }),
  page({
    id: 'm.10.similarity~dilation',
    title: 'Dilation from a center',
    use: 'Use this for “Dilate an 8 by 6 rectangle by a scale factor of 0.5 from the point O.”',
    assumptions: [
      'The center O is 2 squares left of and 1 square below the figure’s bottom left corner.',
      'Each image point is on the ray from O through the original point, k times as far from O.',
      'A factor over 1 enlarges, under 1 shrinks; every length is multiplied by k.',
    ],
    variables: [
      num('k', 'k', 'Scale factor', 0.25, 4, { step: 0.25 }),
      num('w', 'w', 'Width', 1, 12, { step: 1, integer: true }),
      num('h', 'h', 'Height', 1, 12, { step: 1, integer: true }),
      num('W', 'W', 'Image width', 0.25, 48, { step: 0.25 }),
      num('H', 'H', 'Image height', 0.25, 48, { step: 0.25 }),
    ],
    rules: [
      limit(
        'fits the grid',
        'The {w} by {h} figure, its image at scale {k} and the center fit on the grid',
        (v) => {
          const span = (hi: number, c: number) => {
            const xs = [0, hi, c, c + v.k! * (0 - c), c + v.k! * (hi - c)];
            return Math.ceil(Math.max(...xs)) - Math.floor(Math.min(...xs)) + 2;
          };
          return span(v.w!, -2) <= 30 && span(v.h!, -1) <= 30;
        },
        'The image is too big to draw on the grid: try a smaller figure or scale factor.',
      ),
      scaled('W', 'k', 'w', 'width'),
      scaled('H', 'k', 'h', 'height'),
    ],
    example: { k: 0.5, w: 8, h: 6, W: 4, H: 3 },
    startWith: ['k', 'w', 'h'],
    representation: {
      kind: 'scaleCopy',
      factor: 'k',
      width: 'w',
      height: 'h',
      copyWidth: 'W',
      copyHeight: 'H',
      shape: 'rectangle',
      center: [-2, -1],
    },
  }),
  page({
    id: 'm.10.similarity~side-splitter',
    title: 'The side-splitter theorem',
    use: 'Use this for “DE ∥ BC, AD = 6, DB = 4 and AE = 9. Find EC.”',
    assumptions: [
      'D is on AB, E is on AC, and DE is parallel to BC.',
      'A line parallel to one side cuts the other two sides in the same ratio: AD ÷ DB = AE ÷ EC.',
      '△ADE is △ABC dilated from A by k = AD ÷ AB.',
    ],
    variables: [
      len('ad', 'AD', 'AD'),
      len('db', 'DB', 'DB'),
      len('ae', 'AE', 'AE'),
      len('ec', 'EC', 'EC'),
      len('ab', 'AB', 'Side AB', 2000),
      len('ac', 'AC', 'Side AC', 2000),
      num('k', 'k', 'Scale factor AD ÷ AB', 0.001, 0.999),
    ],
    rules: [
      sum('ab', 'ad', 'db', 'Side AB is AD and DB put together.'),
      sum('ac', 'ae', 'ec', 'Side AC is AE and EC put together.'),
      scaled('ad', 'k', 'ab', 'side AB'),
      scaled('ae', 'k', 'ac', 'side AC'),
    ],
    example: { ad: 6, db: 4, ae: 9, ec: 6, ab: 10, ac: 15, k: 0.6 },
    startWith: ['ad', 'db', 'ae'],
    representation: {
      kind: 'scaleCopy',
      factor: 'k',
      width: 'ab',
      height: 'ac',
      splitter: { parts: ['ad', 'db', 'ae', 'ec'] },
    },
  }),
  page({
    id: 'm.10.similarity~splitter-base',
    title: 'The parallel side of a split triangle',
    use: 'Use this for “DE ∥ BC, AD = 3, AB = 12 and BC = 20. How long is DE?”',
    assumptions: [
      'DE is parallel to BC, with D on AB and E on AC.',
      '△ADE is similar to △ABC with scale factor k = AD ÷ AB.',
      'So DE = k × BC and AE = k × AC.',
    ],
    variables: [
      len('ab', 'AB', 'Side AB'),
      len('ac', 'AC', 'Side AC'),
      len('bc', 'BC', 'Side BC'),
      len('ad', 'AD', 'AD'),
      num('k', 'k', 'Scale factor AD ÷ AB', 0.001, 0.999),
      len('ae', 'AE', 'AE'),
      len('de', 'DE', 'DE'),
    ],
    rules: [
      closes('ab', 'ac', 'bc'),
      scaled('ad', 'k', 'ab', 'side AB'),
      scaled('ae', 'k', 'ac', 'side AC'),
      scaled('de', 'k', 'bc', 'side BC'),
    ],
    example: { ab: 12, ac: 16, bc: 20, ad: 3, k: 0.25, ae: 4, de: 5 },
    startWith: ['ab', 'ac', 'bc', 'ad'],
    representation: {
      kind: 'scaleCopy',
      factor: 'k',
      width: 'ab',
      height: 'ac',
      splitter: { base: ['de', 'bc'] },
    },
  }),
  page({
    id: 'm.10.similarity~scale-area',
    title: 'Scale factor, perimeter and area',
    use: 'Use this for “A 3 by 4 rectangle is enlarged by 2.5. What are the new perimeter and area?”',
    assumptions: [
      'Lengths are counted in grid squares, areas in square units.',
      'Every length of the copy is k times the original, a perimeter or circumference too.',
      'Every area is k² times the original: k in both directions.',
    ],
    variables: [
      num('w', 'w', 'Width', 1, 12, { step: 1, integer: true }),
      num('h', 'h', 'Height', 1, 12, { step: 1, integer: true }),
      num('k', 'k', 'Scale factor', 0.1, 10),
      len('W', 'W', 'Copy width', 1000),
      len('H', 'H', 'Copy height', 1000),
      der(len('P', 'P', 'Perimeter', 48)),
      len('P2', 'P₂', 'Copy perimeter', 1000),
      der(len('A', 'A', 'Area', 144)),
      len('A2', 'A₂', 'Copy area', 100000),
    ],
    rules: [
      limit(
        'the copy fits the grid',
        'The {w} by {h} rectangle and its copy at scale {k} fit on the grid',
        (v) => v.w! + v.w! * v.k! <= 26 && Math.max(v.h!, v.h! * v.k!) <= 24,
        'The copy is too big to draw on the grid: try a smaller rectangle or scale factor.',
      ),
      scaled('W', 'k', 'w', 'width'),
      scaled('H', 'k', 'h', 'height'),
      rule(
        'P = 2(w + h)',
        '{P} = 2 × ({w} + {h})',
        {
          P: [
            (v) => 2 * (v.w! + v.h!),
            '2 × ({w} + {h})',
            'The perimeter is twice the width plus the height.',
          ],
          w: [(v) => v.P! / 2 - v.h!, '{P} ÷ 2 − {h}', 'Half the perimeter, less the height.'],
          h: [(v) => v.P! / 2 - v.w!, '{P} ÷ 2 − {w}', 'Half the perimeter, less the width.'],
        },
        (v) => v.P! - 2 * (v.w! + v.h!),
      ),
      rule(
        'A = wh',
        '{A} = {w} × {h}',
        {
          A: [(v) => v.w! * v.h!, '{w} × {h}', 'The area of a rectangle is width times height.'],
          w: [(v) => quot(v.A!, v.h!), '{A} ÷ {h}', 'Divide the area by the height.'],
          h: [(v) => quot(v.A!, v.w!), '{A} ÷ {w}', 'Divide the area by the width.'],
        },
        (v) => v.A! - v.w! * v.h!,
      ),
      scaled('P2', 'k', 'P', 'perimeter'),
      scaled('A2', 'k', 'A', 'area', true),
    ],
    example: { w: 3, h: 4, k: 2.5, W: 7.5, H: 10, P: 14, P2: 35, A: 12, A2: 75 },
    startWith: ['w', 'h', 'k'],
    representation: {
      kind: 'scaleCopy',
      factor: 'k',
      width: 'w',
      height: 'h',
      copyWidth: 'W',
      copyHeight: 'H',
      area: ['A', 'A2'],
      shape: 'rectangle',
    },
  }),
  page({
    id: 'm.10.similarity~right-altitude',
    title: 'Altitude to the hypotenuse',
    use: 'Use this for “The altitude to the hypotenuse cuts it into 4 and 9. How long is the altitude?”',
    assumptions: [
      'The altitude CD from the right angle splits △ABC into two triangles similar to it and to each other.',
      'So the altitude is the geometric mean of the two parts: h² = pq.',
      'Each leg is the geometric mean of the hypotenuse and the part next to it: b² = pc, a² = qc.',
    ],
    variables: [
      len('p', 'p', 'AD'),
      len('q', 'q', 'DB'),
      len('h', 'h', 'Altitude CD'),
      len('c', 'c', 'Hypotenuse AB', 2000),
      len('b', 'b', 'Leg AC', 2000),
      len('a', 'a', 'Leg BC', 2000),
    ],
    rules: [
      rule(
        'h² = pq',
        '{h}² = {p} × {q}',
        {
          h: [
            (v) => root(v.p! * v.q!),
            '√({p} × {q})',
            'The altitude is the geometric mean of the two parts.',
          ],
          p: [(v) => quot(v.h! ** 2, v.q!), '{h}² ÷ {q}', 'Divide h² by the other part.'],
          q: [(v) => quot(v.h! ** 2, v.p!), '{h}² ÷ {p}', 'Divide h² by the other part.'],
        },
        (v) => v.h! ** 2 - v.p! * v.q!,
      ),
      sum('c', 'p', 'q', 'The two parts make the hypotenuse.'),
      rule(
        'b² = pc',
        '{b}² = {p} × {c}',
        {
          b: [
            (v) => root(v.p! * v.c!),
            '√({p} × {c})',
            'Leg AC is the geometric mean of AD and AB.',
          ],
          p: [(v) => quot(v.b! ** 2, v.c!), '{b}² ÷ {c}', 'Divide b² by the hypotenuse.'],
        },
        (v) => v.b! ** 2 - v.p! * v.c!,
      ),
      rule(
        'a² = qc',
        '{a}² = {q} × {c}',
        {
          a: [
            (v) => root(v.q! * v.c!),
            '√({q} × {c})',
            'Leg BC is the geometric mean of DB and AB.',
          ],
          q: [(v) => quot(v.a! ** 2, v.c!), '{a}² ÷ {c}', 'Divide a² by the hypotenuse.'],
        },
        (v) => v.a! ** 2 - v.q! * v.c!,
      ),
    ],
    example: { p: 4, q: 9, h: 6, c: 13, b: Math.sqrt(52), a: Math.sqrt(117) },
    startWith: ['p', 'q'],
    representation: {
      kind: 'markedFigure',
      points: { A: [0, 0], B: ['c', 0], D: ['p', 0], C: ['p', 'h'] },
      parts: [
        { segment: 'AB' },
        { segment: 'AC' },
        { segment: 'BC' },
        { segment: 'CD', dashed: true },
        { right: 'ACB' },
        { right: 'CDB' },
        { label: 'AD', value: 'p' },
        { label: 'DB', value: 'q' },
        { label: 'CD', value: 'h' },
        { label: 'AC', value: 'b' },
        { label: 'BC', value: 'a' },
      ],
    },
  }),
];

// ─── m.10.conditional-probability ────────────────────────────────────────────

/** A count in a table (whole, 0 to 1000). */
const count = (id: string, name: string, max = 1000) =>
  num(id, id, name, 0, max, { step: 1, integer: true });
/** A probability typed (0 to 1). */
const chance = (id: string, symbol: string, name: string) =>
  num(id, symbol, name, 0, 1, { step: 0.01 });
/** A probability worked out. */
const chanceOut = (id: string, symbol: string, name: string) => der(num(id, symbol, name, 0, 1));
/** total = the parts added. */
const total = (t: string, ids: string[], how: string) =>
  derive(
    `${t} = ${ids.join(' + ')}`,
    `{${t}} = ${ids.map((x) => `{${x}}`).join(' + ')}`,
    t,
    (v) => ids.reduce((s, x) => s + v[x]!, 0),
    ids.map((x) => `{${x}}`).join(' + '),
    how,
  );
/** f = part ÷ whole. */
const share = (f: string, part: string, whole: string, how: string) =>
  derive(
    `${f} = ${part} ÷ ${whole}`,
    `{${f}} = {${part}} ÷ {${whole}}`,
    f,
    (v) => quot(v[part]!, v[whole]!),
    `{${part}} ÷ {${whole}}`,
    how,
  );
/** The chances on a Venn diagram fit: the overlap is in both, and the union is at most 1. */
const vennFits = [
  limit('P(A ∩ B) ≤ P(A)', '{ab} is at most {a}', (v) => v.ab! <= v.a! + 1e-9),
  limit('P(A ∩ B) ≤ P(B)', '{ab} is at most {b}', (v) => v.ab! <= v.b! + 1e-9),
  limit(
    'P(A ∪ B) ≤ 1',
    '{a} + {b} − {ab} is at most 1',
    (v) => v.a! + v.b! - v.ab! <= 1 + 1e-9,
    'P(A) + P(B) − P(A and B) can’t be more than 1.',
  ),
];

const CONDITIONAL: ModuleDef[] = [
  page({
    id: 'm.10.conditional-probability',
    assumptions: [
      'P(Late | Bus) looks only at the bus column: those late out of everyone who took the bus.',
      'The whole is the column total, not the grand total.',
      'P(Bus | Late) looks at the late row instead: the order of the events matters.',
    ],
    variables: [
      count('a', 'Late, bus'),
      count('b', 'Late, walk'),
      count('g', 'Late, car'),
      count('d', 'On time, bus'),
      count('e', 'On time, walk'),
      count('h', 'On time, car'),
      der(num('B', 'B', 'Bus total', 0, 2000)),
      chanceOut('p', 'P(L | B)', 'P(Late | Bus)'),
      chanceOut('q', 'P(B | L)', 'P(Bus | Late)'),
      der(num('N', 'N', 'Grand total', 0, 6000)),
    ],
    rules: [
      total('B', ['a', 'd'], 'Add the bus column.'),
      share('p', 'a', 'B', 'Late among the bus riders only: the cell over its column total.'),
      derive(
        'P(Bus | Late) = a ÷ (a + b + g)',
        '{q} = {a} ÷ ({a} + {b} + {g})',
        'q',
        (v) => quot(v.a!, v.a! + v.b! + v.g!),
        '{a} ÷ ({a} + {b} + {g})',
        'Bus riders among the late students: the cell over its row total.',
      ),
      total('N', ['a', 'b', 'g', 'd', 'e', 'h'], 'Add all six counts: everyone in the table.'),
    ],
    example: { a: 12, b: 4, g: 9, d: 48, e: 36, h: 51, B: 60, p: 0.2, q: 0.48, N: 160 },
    startWith: ['a', 'b', 'g', 'd', 'e', 'h'],
    equation: 'P(Late | Bus) = {a}/{B} = {p}',
    representation: {
      kind: 'table',
      twoWay: {
        rows: ['Late', 'On time'],
        cols: ['Bus', 'Walk', 'Car'],
        cells: [
          ['a', 'b', 'g'],
          ['d', 'e', 'h'],
        ],
        lit: { row: 0, col: 0 },
        of: 'col',
        frequency: 'p',
        bar: 'cols',
      },
    },
  }),
  page({
    id: 'm.10.conditional-probability~tree',
    title: 'A tree with conditional branches',
    use: 'Use this for “P(Rain) = 0.3, P(Late | Rain) = 0.4, P(Late | Dry) = 0.1. Find P(Late) and P(Rain | Late).”',
    assumptions: [
      'Each second branch is conditional: P(Late | Rain) is the chance of being late when it rains.',
      'Multiply along a path; add the paths that end in Late for P(Late).',
      'Then P(Rain | Late) is the rain path’s share of P(Late).',
    ],
    variables: [
      chance('r', 'P(R)', 'P(Rain)'),
      chance('a', 'P(L | R)', 'P(Late | Rain)'),
      chance('b', 'P(L | D)', 'P(Late | Dry)'),
      chanceOut('j', 'P(R and L)', 'P(Rain and Late)'),
      chanceOut('t', 'P(L)', 'P(Late)'),
      chanceOut('q', 'P(R | L)', 'P(Rain | Late)'),
    ],
    rules: [
      derive(
        'P(R and L) = P(R) × P(L | R)',
        '{j} = {r} × {a}',
        'j',
        (v) => v.r! * v.a!,
        '{r} × {a}',
        'Multiply along the path: rain, then late.',
      ),
      derive(
        'P(L) = P(R)P(L | R) + (1 − P(R))P(L | D)',
        '{t} = {j} + (1 − {r}) × {b}',
        't',
        (v) => v.j! + (1 - v.r!) * v.b!,
        '{j} + (1 − {r}) × {b}',
        'Add the two paths that end in Late: rain then late, and dry then late.',
      ),
      share('q', 'j', 't', 'The rain path’s share of all the ways to be late.'),
    ],
    example: { r: 0.3, a: 0.4, b: 0.1, j: 0.12, t: 0.19, q: 0.12 / 0.19 },
    startWith: ['r', 'a', 'b'],
    representation: {
      kind: 'treeDiagram',
      chances: {
        first: ['r'],
        second: [['a'], ['b']],
        names: [
          ['Rain', 'Dry'],
          ['Late', 'On time'],
        ],
        stages: ['Weather', 'Arrival'],
        path: [0, 0],
        chance: 'j',
        totalOf: 0,
        total: 't',
      },
    },
  }),
  page({
    id: 'm.10.conditional-probability~independent',
    title: 'Independent events',
    use: 'Use this for “A and B are independent, P(A) = 0.6 and P(B) = 0.3. Find P(A and B) and P(A or B).”',
    assumptions: [
      'A and B are independent: P(B | A) is the same as P(B), on every first branch.',
      'So P(A and B) = P(A) × P(B).',
      'The addition rule then gives P(A or B) = P(A) + P(B) − P(A and B).',
    ],
    variables: [
      chance('a', 'P(A)', 'P(A)'),
      chance('b', 'P(B)', 'P(B)'),
      chanceOut('j', 'P(A and B)', 'P(A and B)'),
      chanceOut('o', 'P(A or B)', 'P(A or B)'),
    ],
    rules: [
      derive(
        'P(A and B) = P(A) × P(B)',
        '{j} = {a} × {b}',
        'j',
        (v) => v.a! * v.b!,
        '{a} × {b}',
        'Independent: multiply the two chances.',
      ),
      derive(
        'P(A or B) = P(A) + P(B) − P(A and B)',
        '{o} = {a} + {b} − {j}',
        'o',
        (v) => v.a! + v.b! - v.j!,
        '{a} + {b} − {j}',
        'Add the two, then take off the overlap counted twice.',
      ),
    ],
    example: { a: 0.6, b: 0.3, j: 0.18, o: 0.72 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'treeDiagram',
      chances: {
        first: ['a'],
        second: [['b'], ['b']],
        names: [
          ['A', 'Not A'],
          ['B', 'Not B'],
        ],
        stages: ['First event', 'Second event'],
        path: [0, 0],
        chance: 'j',
      },
    },
  }),
  page({
    id: 'm.10.conditional-probability~dependent',
    title: 'Two draws without replacement',
    use: 'Use this for “A bag has 5 red and 3 blue marbles. Two are drawn without putting the first back. Find P(red, then red).”',
    assumptions: [
      'The first draw is red with chance r ÷ n.',
      'Without replacement one marble is gone: after a red, r − 1 reds are left of n − 1.',
      'The second draw depends on the first. Multiply along the path.',
    ],
    variables: [
      num('rd', 'r', 'Red marbles', 1, 50, { step: 1, integer: true }),
      num('n', 'n', 'Marbles in all', 2, 100, { step: 1, integer: true }),
      chanceOut('p1', 'P(R)', 'P(Red first)'),
      chanceOut('p2', 'P(R | R)', 'P(Red second | Red first)'),
      chanceOut('p3', 'P(R | B)', 'P(Red second | Blue first)'),
      chanceOut('pp', 'P(R, R)', 'P(Red, then Red)'),
    ],
    rules: [
      limit(
        'r ≤ n',
        '{rd} is at most {n}',
        (v) => v.rd! <= v.n!,
        'There can’t be more red marbles than marbles in all.',
      ),
      share('p1', 'rd', 'n', 'Reds out of all the marbles.'),
      derive(
        'P(R | R) = (r − 1) ÷ (n − 1)',
        '{p2} = ({rd} − 1) ÷ ({n} − 1)',
        'p2',
        (v) => quot(v.rd! - 1, v.n! - 1),
        '({rd} − 1) ÷ ({n} − 1)',
        'One red and one marble fewer after a red.',
      ),
      derive(
        'P(R | B) = r ÷ (n − 1)',
        '{p3} = {rd} ÷ ({n} − 1)',
        'p3',
        (v) => (v.rd! <= v.n! - 1 ? quot(v.rd!, v.n! - 1) : 0),
        '{rd} ÷ ({n} − 1)',
        'Every red is left after a blue.',
      ),
      derive(
        'P(R, R) = P(R) × P(R | R)',
        '{pp} = {p1} × {p2}',
        'pp',
        (v) => v.p1! * v.p2!,
        '{p1} × {p2}',
        'Multiply along the path.',
      ),
    ],
    example: { rd: 5, n: 8, p1: 5 / 8, p2: 4 / 7, p3: 5 / 7, pp: 5 / 14 },
    startWith: ['rd', 'n'],
    representation: {
      kind: 'treeDiagram',
      chances: {
        first: ['p1'],
        second: [['p2'], ['p3']],
        names: [
          ['Red', 'Blue'],
          ['Red', 'Blue'],
        ],
        stages: ['First draw', 'Second draw'],
        path: [0, 0],
        chance: 'pp',
      },
    },
  }),
  page({
    id: 'm.10.conditional-probability~venn',
    title: 'Conditional probability on a Venn diagram',
    use: 'Use this for “P(A) = 0.5, P(B) = 0.4 and P(A and B) = 0.15. Find P(B | A). Are A and B independent?”',
    assumptions: [
      'Given A, only the A circle counts: P(B | A) = P(A and B) ÷ P(A).',
      'A and B are independent only when P(B | A) = P(B).',
      'Here 0.3 is not 0.4, so knowing A changes the chance of B.',
    ],
    variables: [
      chance('a', 'P(A)', 'P(A)'),
      chance('b', 'P(B)', 'P(B)'),
      chance('ab', 'P(A ∩ B)', 'P(A and B)'),
      chanceOut('c', 'P(B | A)', 'P(B | A)'),
      chanceOut('d', 'P(A | B)', 'P(A | B)'),
    ],
    rules: [
      ...vennFits,
      share('c', 'ab', 'a', 'Only the A circle counts: the overlap’s share of A.'),
      share('d', 'ab', 'b', 'Only the B circle counts: the overlap’s share of B.'),
    ],
    example: { a: 0.5, b: 0.4, ab: 0.15, c: 0.3, d: 0.375 },
    startWith: ['a', 'b', 'ab'],
    representation: {
      kind: 'venn',
      chances: { a: 'a', b: 'b', both: 'ab', names: ['A', 'B'], shade: 'and' },
    },
  }),
];

export const MATH_10_MODULES: ModuleDef[] = [...SIMILARITY, ...TRIG, ...CONDITIONAL];
