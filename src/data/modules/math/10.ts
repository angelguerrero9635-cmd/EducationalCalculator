/**
 * Grade 10 math: every calculator module for the grade, the skill's main page first
 * and its problem types (`<skill id>~<slug>`) after it. Shared relation helpers live in
 * `../helpers.ts`; worked-line helpers in `../work.ts`. Rules: docs/MODULE_GUIDE.md; the
 * direction plan and build notes: docs/BUILD_HS.md, docs/build/m.10.md.
 * The layout pages (explore, sort, sequence, observe) are in `../layouts/math10.ts`.
 */
import { formatNumber } from '@/engine/format';
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

// ─── m.10.coordinate-geometry ────────────────────────────────────────────────

/** A coordinate from −20 to 20. */
const coord = (id: string, symbol: string, name: string, step = 0.5) =>
  num(id, symbol, name, -20, 20, { step });
/** c = (a + b) ÷ 2, solved for any one. */
const half = (c: string, a: string, b: string, what: string) =>
  rule(
    `${c} = (${a} + ${b})/2`,
    `{${c}} = ({${a}} + {${b}}) ÷ 2`,
    {
      [c]: [
        (v) => (v[a]! + v[b]!) / 2,
        `({${a}} + {${b}}) ÷ 2`,
        `The midpoint’s ${what} is the average of the ends’.`,
      ],
      [a]: [
        (v) => 2 * v[c]! - v[b]!,
        `2 × {${c}} − {${b}}`,
        'The midpoint is halfway, so A is as far on the other side.',
      ],
      [b]: [
        (v) => 2 * v[c]! - v[a]!,
        `2 × {${c}} − {${a}}`,
        'The midpoint is halfway, so B is as far on the other side.',
      ],
    },
    (v) => 2 * v[c]! - v[a]! - v[b]!,
  );
/** d = √((x₂ − x₁)² + (y₂ − y₁)²), worked out from two points. */
const distance = (d: string, x1: string, y1: string, x2: string, y2: string, name = '') =>
  derive(
    `${d} = √((${x2} − ${x1})² + (${y2} − ${y1})²)`,
    `{${d}} = √(({${x2}} − {${x1}})² + ({${y2}} − {${y1}})²)`,
    d,
    (v) => Math.hypot(v[x2]! - v[x1]!, v[y2]! - v[y1]!),
    `√(({${x2}} − {${x1}})² + ({${y2}} − {${y1}})²)`,
    `${name}The distance formula: the change across and the change up are the legs of a right triangle.`,
  );
/** The slope of side PQ from its corners (none for a vertical side). */
const sideSlope = (m: string, p: string, q: string) => {
  const [px, py, qx, qy] = [`${p}x`, `${p}y`, `${q}x`, `${q}y`];
  const f = (v: Values) => (v[qx]! === v[px]! ? undefined : (v[qy]! - v[py]!) / (v[qx]! - v[px]!));
  return rule(
    `m${p}${q} = (${q}y − ${p}y)/(${q}x − ${p}x)`,
    `{${m}} = ({${qy}} − {${py}}) ÷ ({${qx}} − {${px}})`,
    {
      [m]: [
        f,
        `({${qy}} − {${py}}) ÷ ({${qx}} − {${px}})`,
        `Rise over run from ${p.toUpperCase()} to ${q.toUpperCase()}.`,
      ],
    },
    (v) => (v[qx]! === v[px]! ? 1 : v[m]! - f(v)!),
  );
};
/** Corner P's coordinates. */
const corner = (p: string) => [
  coord(`${p}x`, `x${p.toUpperCase()}`, `x of ${p.toUpperCase()}`, 1),
  coord(`${p}y`, `y${p.toUpperCase()}`, `y of ${p.toUpperCase()}`, 1),
];
const slopeOut = (id: string, side: string) =>
  der(num(id, `m${side}`, `Slope of ${side}`, -1000, 1000));

const COORDINATES: ModuleDef[] = [
  page({
    id: 'm.10.coordinate-geometry',
    assumptions: [
      'The segment AB is the hypotenuse of a right triangle whose legs go straight across and straight up.',
      'The legs are x₂ − x₁ and y₂ − y₁, so d = √((x₂ − x₁)² + (y₂ − y₁)²).',
      'Squaring makes a negative change positive: the order of the points doesn’t matter.',
    ],
    variables: [
      coord('x1', 'x₁', 'x of A'),
      coord('y1', 'y₁', 'y of A'),
      coord('x2', 'x₂', 'x of B'),
      coord('y2', 'y₂', 'y of B'),
      der(num('d', 'd', 'Distance AB', 0, 60)),
    ],
    rules: [distance('d', 'x1', 'y1', 'x2', 'y2')],
    example: { x1: -3, y1: 2, x2: 5, y2: 8, d: 10 },
    startWith: ['x1', 'y1', 'x2', 'y2'],
    representation: {
      kind: 'coordinatePlane',
      x: 'x1',
      y: 'y1',
      second: { x: 'x2', y: 'y2' },
      segment: true,
      legs: true,
      distance: 'd',
      extent: 20,
      quadrants: 4,
    },
  }),
  page({
    id: 'm.10.coordinate-geometry~midpoint',
    title: 'The midpoint of a segment',
    use: 'Use this for “Find the midpoint of the segment from (−4, 3) to (8, −5)” or “M is the midpoint; find the other end.”',
    assumptions: [
      'The midpoint M is halfway from A to B, across and up.',
      'Its coordinates are the averages: ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2).',
      'Given M and one end, the other end is as far past M: x₂ = 2x − x₁.',
    ],
    standalone: {
      vars: ['x1', 'x2', 'mx'],
      why: 'The x-coordinates are worked out apart from the y-coordinates.',
    },
    variables: [
      coord('x1', 'x₁', 'x of A'),
      coord('y1', 'y₁', 'y of A'),
      coord('x2', 'x₂', 'x of B'),
      coord('y2', 'y₂', 'y of B'),
      num('mx', 'x', 'x of M', -20, 20, { step: 0.25 }),
      num('my', 'y', 'y of M', -20, 20, { step: 0.25 }),
    ],
    rules: [half('mx', 'x1', 'x2', 'x'), half('my', 'y1', 'y2', 'y')],
    example: { x1: -4, y1: 3, x2: 8, y2: -5, mx: 2, my: -1 },
    startWith: ['x1', 'y1', 'x2', 'y2'],
    representation: {
      kind: 'coordinatePlane',
      x: 'x1',
      y: 'y1',
      second: { x: 'x2', y: 'y2' },
      segment: true,
      midpoint: { x: 'mx', y: 'my' },
      extent: 20,
      quadrants: 4,
    },
  }),
  page({
    id: 'm.10.coordinate-geometry~partition',
    title: 'The point that splits a segment in a ratio',
    use: 'Use this for “Find the point P on AB, A(−2, 1) and B(10, 7), with AP:PB = 1:2.”',
    assumptions: [
      'P is on AB with AP:PB = m:n.',
      'Cut AB into m + n equal pieces; P is m pieces from A, the fraction m ÷ (m + n) of the way.',
      'Take that fraction of the change across and of the change up, starting from A.',
    ],
    variables: [
      coord('x1', 'x₁', 'x of A'),
      coord('y1', 'y₁', 'y of A'),
      coord('x2', 'x₂', 'x of B'),
      coord('y2', 'y₂', 'y of B'),
      num('m', 'm', 'Pieces from A to P', 1, 10, { step: 1, integer: true }),
      num('n', 'n', 'Pieces from P to B', 1, 10, { step: 1, integer: true }),
      der(num('px', 'x', 'x of P', -20, 20)),
      der(num('py', 'y', 'y of P', -20, 20)),
    ],
    rules: (['x', 'y'] as const).map((c) =>
      derive(
        `P${c} = A${c} + m/(m + n) × (B${c} − A${c})`,
        `{p${c}} = {${c}1} + {m} ÷ ({m} + {n}) × ({${c}2} − {${c}1})`,
        `p${c}`,
        (v) => v[`${c}1`]! + (v.m! / (v.m! + v.n!)) * (v[`${c}2`]! - v[`${c}1`]!),
        `{${c}1} + {m} ÷ ({m} + {n}) × ({${c}2} − {${c}1})`,
        `Start at A and go m of the m + n equal pieces of the change in ${c}.`,
      ),
    ),
    example: { x1: -2, y1: 1, x2: 10, y2: 7, m: 1, n: 2, px: 2, py: 3 },
    startWith: ['x1', 'y1', 'x2', 'y2', 'm', 'n'],
    representation: {
      kind: 'coordinatePlane',
      x: 'x1',
      y: 'y1',
      second: { x: 'x2', y: 'y2' },
      segment: true,
      partition: { ratio: ['m', 'n'], x: 'px', y: 'py' },
      extent: 20,
      quadrants: 4,
    },
  }),
  page({
    id: 'm.10.coordinate-geometry~parallelogram',
    title: 'Prove a parallelogram with slopes',
    use: 'Use this for “Show that A(−3, −1), B(−1, 3), C(5, 4), D(3, 0) is a parallelogram.”',
    assumptions: [
      'Sides with equal slopes are parallel.',
      'Both pairs of opposite sides parallel: the quadrilateral is a parallelogram.',
      'Two sides are perpendicular when their slopes multiply to −1.',
    ],
    variables: [
      ...['a', 'b', 'c', 'd'].flatMap(corner),
      slopeOut('mab', 'AB'),
      slopeOut('mbc', 'BC'),
      slopeOut('mdc', 'DC'),
      slopeOut('mad', 'AD'),
    ],
    rules: [
      sideSlope('mab', 'a', 'b'),
      sideSlope('mbc', 'b', 'c'),
      sideSlope('mdc', 'd', 'c'),
      sideSlope('mad', 'a', 'd'),
    ],
    example: {
      ax: -3,
      ay: -1,
      bx: -1,
      by: 3,
      cx: 5,
      cy: 4,
      dx: 3,
      dy: 0,
      mab: 2,
      mbc: 1 / 6,
      mdc: 2,
      mad: 1 / 6,
    },
    startWith: ['ax', 'ay', 'bx', 'by', 'cx', 'cy', 'dx', 'dy'],
    representation: {
      kind: 'coordinatePlane',
      x: 'ax',
      y: 'ay',
      polygon: [
        ['ax', 'ay'],
        ['bx', 'by'],
        ['cx', 'cy'],
        ['dx', 'dy'],
      ],
      slopes: true,
      extent: 20,
      quadrants: 4,
    },
  }),
  page({
    id: 'm.10.coordinate-geometry~right-triangle',
    title: 'Prove a right triangle with slopes',
    use: 'Use this for “Is the triangle A(−1, 1), B(1, 5), C(5, 3) a right triangle?”',
    assumptions: [
      'Two sides are perpendicular when their slopes multiply to −1.',
      'A vertical side has no slope; it is perpendicular to a level side (slope 0).',
      'A right angle at B makes AB and BC perpendicular.',
    ],
    variables: [
      ...['a', 'b', 'c'].flatMap(corner),
      slopeOut('mab', 'AB'),
      slopeOut('mbc', 'BC'),
      slopeOut('mac', 'AC'),
      der(num('p', 'p', 'Slope of AB × slope of BC', -1e6, 1e6)),
    ],
    rules: [
      sideSlope('mab', 'a', 'b'),
      sideSlope('mbc', 'b', 'c'),
      sideSlope('mac', 'a', 'c'),
      derive(
        'p = mAB × mBC',
        '{p} = {mab} × {mbc}',
        'p',
        (v) => v.mab! * v.mbc!,
        '{mab} × {mbc}',
        'Multiply the two slopes at B: −1 means a right angle.',
      ),
    ],
    example: { ax: -1, ay: 1, bx: 1, by: 5, cx: 5, cy: 3, mab: 2, mbc: -0.5, mac: 1 / 3, p: -1 },
    startWith: ['ax', 'ay', 'bx', 'by', 'cx', 'cy'],
    representation: {
      kind: 'coordinatePlane',
      x: 'ax',
      y: 'ay',
      polygon: [
        ['ax', 'ay'],
        ['bx', 'by'],
        ['cx', 'cy'],
      ],
      slopes: true,
      extent: 20,
      quadrants: 4,
    },
  }),
  page({
    id: 'm.10.coordinate-geometry~perimeter',
    title: 'Perimeter and area on the grid',
    use: 'Use this for “Find the perimeter and area of the triangle A(0, 0), B(6, 0), C(3, 4).”',
    assumptions: [
      'Each side’s length comes from the distance formula.',
      'Side AB is level, so it is the base and the height is how far C is above or below it.',
      'Area = ½ × base × height.',
    ],
    variables: [
      ...['a', 'b', 'c'].flatMap(corner),
      der(num('ab', 'AB', 'Side AB', 0, 60)),
      der(num('bc', 'BC', 'Side BC', 0, 60)),
      der(num('ca', 'CA', 'Side CA', 0, 60)),
      der(num('P', 'P', 'Perimeter', 0, 180)),
      der(num('K', 'K', 'Area', 0, 1000)),
    ],
    rules: [
      limit(
        'side AB is level',
        '{ay} = {by}: side AB is level',
        (v) => v.ay! === v.by!,
        'Put A and B at the same height, so AB is a level base.',
      ),
      distance('ab', 'ax', 'ay', 'bx', 'by', 'AB: '),
      distance('bc', 'bx', 'by', 'cx', 'cy', 'BC: '),
      distance('ca', 'cx', 'cy', 'ax', 'ay', 'CA: '),
      total('P', ['ab', 'bc', 'ca'], 'Add the three sides.'),
      derive(
        'K = ½ × |xB − xA| × |yC − yA|',
        '{K} = |{bx} − {ax}| × |{cy} − {ay}| ÷ 2',
        'K',
        (v) => (Math.abs(v.bx! - v.ax!) * Math.abs(v.cy! - v.ay!)) / 2,
        '|{bx} − {ax}| × |{cy} − {ay}| ÷ 2',
        'Half of base times height: the base along the level side, the height straight up to C.',
      ),
    ],
    example: { ax: 0, ay: 0, bx: 6, by: 0, cx: 3, cy: 4, ab: 6, bc: 5, ca: 5, P: 16, K: 12 },
    startWith: ['ax', 'ay', 'bx', 'by', 'cx', 'cy'],
    representation: {
      kind: 'coordinatePlane',
      x: 'ax',
      y: 'ay',
      polygon: [
        ['ax', 'ay'],
        ['bx', 'by'],
        ['cx', 'cy'],
      ],
      extent: 20,
      quadrants: 4,
    },
  }),
];

// ─── m.10.special-right-triangles ────────────────────────────────────────────

/** The sign between two numbers as a relation box: 1 <, 3 >, 5 = (equal to 9 digits). */
const signOf = (x: number, y: number) =>
  Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y)) ? 5 : x < y ? 1 : 3;
const SIGN_TEXT: Record<number, string> = { 1: '<', 3: '>', 5: '=' };

const SPECIAL: ModuleDef[] = [
  page({
    id: 'm.10.special-right-triangles',
    assumptions: [
      'c is the longest side. Compare a² + b² with c².',
      'Equal: a right triangle (the converse of the Pythagorean theorem).',
      'a² + b² less than c²: obtuse. More than c²: acute.',
    ],
    variables: [
      len('a', 'a', 'Side a'),
      len('b', 'b', 'Side b'),
      len('c', 'c', 'Longest side c'),
      der(num('s', 'a² + b²', 'Sum of the squares of a and b', 0, 2e6)),
      der(num('q', 'c²', 'Square of c', 0, 2e6)),
      der(num('r', 'r', 'Sign (1 <, 3 >, 5 =)', 1, 5, { step: 1, integer: true })),
    ],
    rules: [
      limit(
        'c is the longest side',
        '{c} is at least {a} and {b}',
        (v) => v.c! >= v.a! && v.c! >= v.b!,
        'Put the longest side in c.',
      ),
      limit(
        'the sides close',
        '{a} + {b} is more than {c}',
        (v) => v.a! + v.b! > v.c!,
        'The two shorter sides must add to more than the longest.',
      ),
      derive(
        's = a² + b²',
        '{s} = {a}² + {b}²',
        's',
        (v) => v.a! ** 2 + v.b! ** 2,
        '{a}² + {b}²',
        'Square the two shorter sides and add.',
      ),
      derive('q = c²', '{q} = {c}²', 'q', (v) => v.c! ** 2, '{c}²', 'Square the longest side.'),
      {
        relation: {
          id: 'r = sign between a² + b² and c²',
          display: 'sign {r} between {s} and {q}',
          vars: ['r', 's', 'q'],
          check: (v: Values) => `${signOf(v.s!, v.q!)} = ${v.r}`,
          residual: (v: Values) => v.r! - signOf(v.s!, v.q!),
          solve: {
            r: (v: Values) => signOf(v.s!, v.q!),
            s: () => undefined,
            q: () => undefined,
          },
        },
        steps: {
          r: {
            expr: (v: Values) => `${signOf(v.s!, v.q!)}`,
            how: (v: Values) =>
              ({
                1: 'a² + b² is less than c²: the angle across from c is obtuse.',
                3: 'a² + b² is more than c²: every angle is acute.',
                5: 'a² + b² equals c²: a right triangle, the right angle across from c.',
              })[signOf(v.s!, v.q!)]!,
            note: (v: Values) => `(${SIGN_TEXT[signOf(v.s!, v.q!)]})`,
          },
        },
      },
    ],
    example: { a: 8, b: 15, c: 17, s: 289, q: 289, r: 5 },
    startWith: ['a', 'b', 'c'],
    equation: '{a}^2 + {b}^2 {r:relation} {c}^2',
    representation: { kind: 'triangleSolver', parts: { a: 'a', b: 'b', c: 'c' } },
  }),
  page({
    id: 'm.10.special-right-triangles~45-45-90',
    title: 'The 45°-45°-90° triangle',
    use: 'Use this for “A leg of a 45°-45°-90° triangle is 7. How long is the hypotenuse?”',
    assumptions: [
      'A 45°-45°-90° triangle is half a square: its two legs are equal.',
      'So c² = s² + s² = 2s², and the hypotenuse is a leg times √2.',
      'Going back, a leg is the hypotenuse ÷ √2.',
    ],
    variables: [len('s', 's', 'Leg'), len('c', 'c', 'Hypotenuse', 1500)],
    rules: [
      rule(
        'c = s√2',
        '{c} = {s} × √2',
        {
          c: [(v) => v.s! * Math.SQRT2, '{s} × √2', 'The hypotenuse is √2 times a leg.'],
          s: [(v) => v.c! / Math.SQRT2, '{c} ÷ √2', 'Divide the hypotenuse by √2.'],
        },
        (v) => v.c! - v.s! * Math.SQRT2,
      ),
    ],
    example: { s: 7, c: 7 * Math.SQRT2 },
    startWith: ['s'],
    equation: '{c} = {s}√2',
    representation: {
      kind: 'triangleSolver',
      parts: { a: 's', b: 's', c: 'c' },
      special: '45-45-90',
    },
  }),
  page({
    id: 'm.10.special-right-triangles~30-60-90',
    title: 'The 30°-60°-90° triangle',
    use: 'Use this for “The short leg of a 30°-60°-90° triangle is 5. Find the long leg and the hypotenuse.”',
    assumptions: [
      'A 30°-60°-90° triangle is half an equilateral triangle.',
      'The short leg is across from 30°. The hypotenuse is twice it; the long leg is it times √3.',
    ],
    variables: [
      len('s', 's', 'Short leg'),
      len('l', 'l', 'Long leg', 2000),
      len('h', 'h', 'Hypotenuse', 2000),
    ],
    rules: [
      rule(
        'l = s√3',
        '{l} = {s} × √3',
        {
          l: [(v) => v.s! * Math.sqrt(3), '{s} × √3', 'The long leg is √3 times the short leg.'],
          s: [(v) => v.l! / Math.sqrt(3), '{l} ÷ √3', 'Divide the long leg by √3.'],
        },
        (v) => v.l! - v.s! * Math.sqrt(3),
      ),
      rule(
        'h = 2s',
        '{h} = 2 × {s}',
        {
          h: [(v) => 2 * v.s!, '2 × {s}', 'The hypotenuse is twice the short leg.'],
          s: [(v) => v.h! / 2, '{h} ÷ 2', 'The short leg is half the hypotenuse.'],
        },
        (v) => v.h! - 2 * v.s!,
      ),
    ],
    example: { s: 5, l: 5 * Math.sqrt(3), h: 10 },
    startWith: ['s'],
    equation: '{l} = {s}√3',
    representation: {
      kind: 'triangleSolver',
      parts: { a: 's', b: 'l', c: 'h' },
      special: '30-60-90',
    },
  }),
];

// ─── m.10.arc-sector ─────────────────────────────────────────────────────────

const radius = len('r', 'r', 'Radius', 1000, { unit: 'cm' });
const arcLength = len('s', 's', 'Arc length', 1e4, { unit: 'cm', pi: true });
const sectorArea = len('A', 'A', 'Sector area', 4e6, { unit: 'cm²', pi: true });

const ARC_SECTOR: ModuleDef[] = [
  page({
    id: 'm.10.arc-sector',
    assumptions: [
      'A central angle of θ° cuts off θ/360 of the circle.',
      'The arc is that share of the circumference 2πr; the sector is that share of the area πr².',
      'An angle over 180° gives a major arc and a sector bigger than half the circle.',
    ],
    variables: [radius, deg('t', 'θ', 'Central angle', 0.1, 360), arcLength, sectorArea],
    rules: [
      rule(
        's = θ/360 × 2πr',
        '{s} = {t} ÷ 360 × 2 × π × {r}',
        {
          s: [
            (v) => (v.t! / 360) * 2 * Math.PI * v.r!,
            '{t} ÷ 360 × 2 × π × {r}',
            'The arc is the angle’s share of the whole circumference.',
          ],
          t: [
            (v) => quot(360 * v.s!, 2 * Math.PI * v.r!),
            '360 × {s} ÷ (2 × π × {r})',
            'The arc’s share of the circumference, as a share of 360°.',
          ],
          r: [
            (v) => quot(360 * v.s!, 2 * Math.PI * v.t!),
            '360 × {s} ÷ (2 × π × {t})',
            'Undo the share of the circumference.',
          ],
        },
        (v) => v.s! - (v.t! / 360) * 2 * Math.PI * v.r!,
      ),
      rule(
        'A = θ/360 × πr²',
        '{A} = {t} ÷ 360 × π × {r}²',
        {
          A: [
            (v) => (v.t! / 360) * Math.PI * v.r! ** 2,
            '{t} ÷ 360 × π × {r}²',
            'The sector is the angle’s share of the whole circle’s area.',
          ],
          t: [
            (v) => quot(360 * v.A!, Math.PI * v.r! ** 2),
            '360 × {A} ÷ (π × {r}²)',
            'The sector’s share of the area, as a share of 360°.',
          ],
          r: [
            (v) => root(quot(360 * v.A!, Math.PI * v.t!) ?? NaN),
            '√(360 × {A} ÷ (π × {t}))',
            'Undo the share, then the square.',
          ],
        },
        (v) => v.A! - (v.t! / 360) * Math.PI * v.r! ** 2,
      ),
    ],
    example: { r: 6, t: 150, s: 5 * Math.PI, A: 15 * Math.PI },
    startWith: ['r', 't'],
    unitSystems: ['metric'],
    representation: {
      kind: 'circle',
      radius: 'r',
      extent: 1,
      sector: { angle: 't', unit: 'degrees', arc: 's', area: 'A' },
    },
  }),
  page({
    id: 'm.10.arc-sector~radians',
    title: 'Arc length and sector area in radians',
    use: 'Use this for “A sector has radius 4 cm and central angle 2.5 radians. Find its arc length and area.”',
    assumptions: [
      'One radian is the angle whose arc is one radius long; a full turn is 2π radians, or 360°.',
      'In radians the arc is s = rθ and the sector’s area is A = r²θ ÷ 2.',
      'To change radians to degrees, multiply by 180/π.',
    ],
    variables: [
      radius,
      num('t', 'θ', 'Central angle (radians)', 0.01, 6.28),
      arcLength,
      sectorArea,
      der(deg('d', 'θ°', 'Central angle in degrees', 0, 360)),
    ],
    rules: [
      rule(
        's = rθ',
        '{s} = {r} × {t}',
        {
          s: [(v) => v.r! * v.t!, '{r} × {t}', 'In radians the arc is the radius times the angle.'],
          t: [(v) => quot(v.s!, v.r!), '{s} ÷ {r}', 'How many radius-lengths the arc is.'],
          r: [(v) => quot(v.s!, v.t!), '{s} ÷ {t}', 'Undo multiplying by the angle.'],
        },
        (v) => v.s! - v.r! * v.t!,
      ),
      rule(
        'A = r²θ/2',
        '{A} = {r}² × {t} ÷ 2',
        {
          A: [
            (v) => (v.r! ** 2 * v.t!) / 2,
            '{r}² × {t} ÷ 2',
            'The angle’s share of πr²: θ ÷ 2π × πr² is r²θ ÷ 2.',
          ],
          t: [
            (v) => quot(2 * v.A!, v.r! ** 2),
            '2 × {A} ÷ {r}²',
            'Undo the halving, then divide by r².',
          ],
          r: [
            (v) => root(quot(2 * v.A!, v.t!) ?? NaN),
            '√(2 × {A} ÷ {t})',
            'Undo the halving and the angle, then the square.',
          ],
        },
        (v) => v.A! - (v.r! ** 2 * v.t!) / 2,
      ),
      derive(
        'θ° = θ × 180/π',
        '{d} = {t} × 180 ÷ π',
        'd',
        (v) => (v.t! * 180) / Math.PI,
        '{t} × 180 ÷ π',
        'π radians is 180°.',
      ),
    ],
    example: { r: 4, t: 2.5, s: 10, A: 20, d: 450 / Math.PI },
    startWith: ['r', 't'],
    unitSystems: ['metric'],
    representation: {
      kind: 'circle',
      radius: 'r',
      extent: 1,
      views: ['radian', 'sector'],
      sector: { angle: 't', unit: 'radians', arc: 's', area: 'A' },
    },
  }),
];

// ─── m.10.volume-derivations ─────────────────────────────────────────────────

const cm = (id: string, symbol: string, name: string, max = 1000) =>
  len(id, symbol, name, max, { unit: 'cm', units: ['mm', 'cm', 'm'] });
const cm2 = (id: string, symbol: string, name: string) =>
  num(id, symbol, name, 0, 1e8, { unit: 'cm²', units: ['mm²', 'cm²', 'm²'], pi: true });
const cm3 = (id: string, symbol: string, name: string) =>
  num(id, symbol, name, 0, 1e11, { unit: 'cm³', units: ['mm³', 'cm³', 'm³'], pi: true });
/** V = πr²h, solved for any one. */
const cylinderVolume = rule(
  'V = πr²h',
  '{V} = π × {r}² × {h}',
  {
    V: [
      (v) => Math.PI * v.r! ** 2 * v.h!,
      'π × {r}² × {h}',
      'The base’s area πr² times the height.',
    ],
    h: [(v) => quot(v.V!, Math.PI * v.r! ** 2), '{V} ÷ (π × {r}²)', 'Divide by the base’s area.'],
    r: [
      (v) => root(quot(v.V!, Math.PI * v.h!) ?? NaN),
      '√({V} ÷ (π × {h}))',
      'Divide by π × h, then take the square root.',
    ],
  },
  (v) => v.V! - Math.PI * v.r! ** 2 * v.h!,
);
/** ℓ = √(r² + h²) for a cone. */
const coneSlant = pythagoras(
  'r',
  'h',
  'l',
  'The slant height is the long side of the right triangle with legs r and h.',
);

const VOLUME: ModuleDef[] = [
  page({
    id: 'm.10.volume-derivations',
    assumptions: [
      'A cylinder is a stack of circles, each with area πr², so V = πr²h.',
      'Cavalieri: solids with equal cross-sections at every height have equal volumes.',
      'So a leaning stack keeps the same volume as a straight one.',
    ],
    variables: [cm('r', 'r', 'Radius'), cm('h', 'h', 'Height'), cm3('V', 'V', 'Volume')],
    rules: [cylinderVolume],
    example: { r: 3, h: 8, V: 72 * Math.PI },
    startWith: ['r', 'h'],
    unitSystems: ['metric'],
    sliders: true,
    representation: {
      kind: 'curvedSolid',
      shape: 'cylinder',
      radius: 'r',
      height: 'h',
      volume: 'V',
      cavalieri: true,
      extent: 6,
    },
  }),
  page({
    id: 'm.10.volume-derivations~cylinder-surface',
    title: 'Surface area of a cylinder',
    use: 'Use this for “Find the surface area of a can with radius 4 cm and height 7 cm.”',
    assumptions: [
      'Unrolled, a cylinder is two circles and a rectangle.',
      'The rectangle wraps the circle: it is as long as the circumference 2πr and as tall as h.',
      'So S = 2πr² + 2πrh.',
    ],
    variables: [cm('r', 'r', 'Radius'), cm('h', 'h', 'Height'), cm2('S', 'S', 'Surface area')],
    rules: [
      rule(
        'S = 2πr² + 2πrh',
        '{S} = 2 × π × {r}² + 2 × π × {r} × {h}',
        {
          S: [
            (v) => 2 * Math.PI * v.r! ** 2 + 2 * Math.PI * v.r! * v.h!,
            '2 × π × {r}² + 2 × π × {r} × {h}',
            'Two circles and a rectangle 2πr long and h tall.',
          ],
          h: [
            (v) => quot(v.S! - 2 * Math.PI * v.r! ** 2, 2 * Math.PI * v.r!),
            '({S} − 2 × π × {r}²) ÷ (2 × π × {r})',
            'Take away the two circles; the rectangle is 2πr long.',
          ],
          r: [
            (v) => (Math.sqrt(v.h! ** 2 + (2 * v.S!) / Math.PI) - v.h!) / 2,
            '(√({h}² + 2 × {S} ÷ π) − {h}) ÷ 2',
            'Solve 2πr² + 2πhr = S for the positive r (the quadratic formula).',
          ],
        },
        (v) => v.S! - 2 * Math.PI * v.r! ** 2 - 2 * Math.PI * v.r! * v.h!,
      ),
    ],
    example: { r: 4, h: 7, S: 88 * Math.PI },
    startWith: ['r', 'h'],
    unitSystems: ['metric'],
    representation: {
      kind: 'curvedSolid',
      shape: 'cylinder',
      radius: 'r',
      height: 'h',
      surface: 'S',
      net: true,
      extent: 6,
    },
  }),
  page({
    id: 'm.10.volume-derivations~cone',
    title: 'Volume of a cone',
    use: 'Use this for “A cone has radius 3 cm and height 4 cm. Find its volume.”',
    assumptions: [
      'A cone holds one third of the cylinder with the same base and height.',
      'So V = ⅓πr²h, with h the straight-up height, not the slant.',
    ],
    variables: [cm('r', 'r', 'Radius'), cm('h', 'h', 'Height'), cm3('V', 'V', 'Volume')],
    rules: [
      rule(
        'V = πr²h/3',
        '{V} = π × {r}² × {h} ÷ 3',
        {
          V: [
            (v) => (Math.PI * v.r! ** 2 * v.h!) / 3,
            'π × {r}² × {h} ÷ 3',
            'One third of the cylinder with the same base and height.',
          ],
          h: [
            (v) => quot(3 * v.V!, Math.PI * v.r! ** 2),
            '3 × {V} ÷ (π × {r}²)',
            'Undo the third, then divide by the base’s area.',
          ],
          r: [
            (v) => root(quot(3 * v.V!, Math.PI * v.h!) ?? NaN),
            '√(3 × {V} ÷ (π × {h}))',
            'Undo the third, divide by π × h, then take the square root.',
          ],
        },
        (v) => v.V! - (Math.PI * v.r! ** 2 * v.h!) / 3,
      ),
    ],
    example: { r: 3, h: 4, V: 12 * Math.PI },
    startWith: ['r', 'h'],
    unitSystems: ['metric'],
    representation: {
      kind: 'curvedSolid',
      shape: 'cone',
      radius: 'r',
      height: 'h',
      volume: 'V',
      extent: 5,
    },
  }),
  page({
    id: 'm.10.volume-derivations~cone-surface',
    title: 'Surface area of a cone',
    use: 'Use this for “A cone has radius 3 cm and height 4 cm. Find its slant height and surface area.”',
    assumptions: [
      'The slant height ℓ is the hypotenuse of the right triangle with legs r and h.',
      'Unrolled, the side is a sector of radius ℓ whose arc wraps the base; its area is πrℓ.',
      'So S = πr² + πrℓ.',
    ],
    variables: [
      cm('r', 'r', 'Radius'),
      cm('h', 'h', 'Height'),
      cm('l', 'ℓ', 'Slant height', 1500),
      cm2('S', 'S', 'Surface area'),
    ],
    rules: [
      coneSlant,
      rule(
        'S = πr² + πrℓ',
        '{S} = π × {r}² + π × {r} × {l}',
        {
          S: [
            (v) => Math.PI * v.r! ** 2 + Math.PI * v.r! * v.l!,
            'π × {r}² + π × {r} × {l}',
            'The base circle and the sector, whose area is πrℓ.',
          ],
          l: [
            (v) => quot(v.S! - Math.PI * v.r! ** 2, Math.PI * v.r!),
            '({S} − π × {r}²) ÷ (π × {r})',
            'Take away the base; the sector is πrℓ.',
          ],
        },
        (v) => v.S! - Math.PI * v.r! ** 2 - Math.PI * v.r! * v.l!,
      ),
    ],
    example: { r: 3, h: 4, l: 5, S: 24 * Math.PI },
    startWith: ['r', 'h'],
    unitSystems: ['metric'],
    representation: {
      kind: 'curvedSolid',
      shape: 'cone',
      radius: 'r',
      height: 'h',
      slant: 'l',
      surface: 'S',
      net: true,
      extent: 5,
    },
  }),
  page({
    id: 'm.10.volume-derivations~pyramid',
    title: 'Volume of a pyramid',
    use: 'Use this for “A square pyramid has base side 6 cm and height 10 cm. Find its volume.”',
    assumptions: [
      'The base is a square with side b; h is the straight-up height to the tip.',
      'A pyramid holds one third of the prism with the same base and height: V = ⅓b²h.',
      'Level cuts are smaller squares, shrinking evenly to the tip.',
    ],
    variables: [
      cm('b', 'b', 'Base side'),
      cm('h', 'h', 'Height'),
      num('V', 'V', 'Volume', 0, 1e11, { unit: 'cm³', units: ['mm³', 'cm³', 'm³'] }),
    ],
    rules: [
      rule(
        'V = b²h/3',
        '{V} = {b}² × {h} ÷ 3',
        {
          V: [
            (v) => (v.b! ** 2 * v.h!) / 3,
            '{b}² × {h} ÷ 3',
            'One third of the prism with the same base and height.',
          ],
          h: [
            (v) => quot(3 * v.V!, v.b! ** 2),
            '3 × {V} ÷ {b}²',
            'Undo the third, then divide by the base’s area.',
          ],
          b: [
            (v) => root(quot(3 * v.V!, v.h!) ?? NaN),
            '√(3 × {V} ÷ {h})',
            'Undo the third, divide by h, then take the square root.',
          ],
        },
        (v) => v.V! - (v.b! ** 2 * v.h!) / 3,
      ),
    ],
    example: { b: 6, h: 10, V: 120 },
    startWith: ['b', 'h'],
    unitSystems: ['metric'],
    representation: {
      kind: 'crossSection',
      solid: 'pyramid',
      length: 'b',
      height: 'h',
      volume: 'V',
    },
  }),
  page({
    id: 'm.10.volume-derivations~sphere',
    title: 'Surface area and volume of a sphere',
    use: 'Use this for “A ball has radius 5 cm. Find its surface area and volume.”',
    assumptions: [
      'The surface area is four times a great circle: S = 4πr².',
      'The volume is V = 4/3πr³.',
      'Given S or V, work back to the radius first.',
    ],
    variables: [cm('r', 'r', 'Radius'), cm2('S', 'S', 'Surface area'), cm3('V', 'V', 'Volume')],
    rules: [
      rule(
        'S = 4πr²',
        '{S} = 4 × π × {r}²',
        {
          S: [(v) => 4 * Math.PI * v.r! ** 2, '4 × π × {r}²', 'Four great circles, each πr².'],
          r: [
            (v) => root(v.S! / (4 * Math.PI)),
            '√({S} ÷ (4 × π))',
            'Divide by 4π, then take the square root.',
          ],
        },
        (v) => v.S! - 4 * Math.PI * v.r! ** 2,
      ),
      rule(
        'V = 4πr³/3',
        '{V} = 4 × π × {r}³ ÷ 3',
        {
          V: [(v) => (4 * Math.PI * v.r! ** 3) / 3, '4 × π × {r}³ ÷ 3', 'The volume of a sphere.'],
          r: [
            (v) => Math.cbrt((3 * v.V!) / (4 * Math.PI)),
            '∛(3 × {V} ÷ (4 × π))',
            'Undo 4/3 π, then take the cube root.',
          ],
        },
        (v) => v.V! - (4 * Math.PI * v.r! ** 3) / 3,
      ),
    ],
    example: { r: 5, S: 100 * Math.PI, V: (500 * Math.PI) / 3 },
    startWith: ['r'],
    unitSystems: ['metric'],
    representation: {
      kind: 'curvedSolid',
      shape: 'sphere',
      radius: 'r',
      surface: 'S',
      volume: 'V',
      net: true,
      extent: 4,
    },
  }),
  page({
    id: 'm.10.volume-derivations~cross-section',
    title: 'A level cut of a cone',
    use: 'Use this for “A cone has radius 6 cm and height 9 cm. What is the area of a level cut 3 cm up?”',
    assumptions: [
      'A cut parallel to the base is a circle.',
      'Its radius shrinks evenly to 0 at the tip: ρ = r(h − z) ÷ h at height z.',
      'The small cone above the cut is similar to the whole cone.',
    ],
    variables: [
      cm('r', 'r', 'Radius'),
      cm('h', 'h', 'Height'),
      num('z', 'z', 'Height of the cut', 0, 1000, { unit: 'cm' }),
      num('p', 'ρ', 'Radius of the cut', 0, 1000, { unit: 'cm' }),
      cm2('A', 'A', 'Area of the cut'),
    ],
    rules: [
      limit(
        'the plane cuts the cone',
        '{z} is at most {h}',
        (v) => v.z! <= v.h!,
        'The cut must be between the base and the tip.',
      ),
      rule(
        'ρ = r(h − z)/h',
        '{p} = {r} × ({h} − {z}) ÷ {h}',
        {
          p: [
            (v) => (v.z! > v.h! ? undefined : (v.r! * (v.h! - v.z!)) / v.h!),
            '{r} × ({h} − {z}) ÷ {h}',
            'The radius left at that height: similar cones.',
          ],
          z: [
            (v) => v.h! * (1 - v.p! / v.r!),
            '{h} × (1 − {p} ÷ {r})',
            'How far up the radius has shrunk to ρ.',
          ],
        },
        (v) => v.p! - (v.r! * (v.h! - v.z!)) / v.h!,
      ),
      rule(
        'A = πρ²',
        '{A} = π × {p}²',
        {
          A: [(v) => Math.PI * v.p! ** 2, 'π × {p}²', 'The area of the circle.'],
          p: [(v) => root(v.A! / Math.PI), '√({A} ÷ π)', 'Undo the square.'],
        },
        (v) => v.A! - Math.PI * v.p! ** 2,
      ),
    ],
    example: { r: 6, h: 9, z: 3, p: 4, A: 16 * Math.PI },
    startWith: ['r', 'h', 'z'],
    unitSystems: ['metric'],
    representation: {
      kind: 'crossSection',
      solid: 'cone',
      length: 'r',
      height: 'h',
      cut: 'base',
      at: 'z',
      area: 'A',
    },
  }),
];

// ─── m.10.circle-theorems ────────────────────────────────────────────────────

const CIRCLE_THEOREMS: ModuleDef[] = [
  page({
    id: 'm.10.circle-theorems',
    assumptions: [
      'A central angle has its vertex at the center O; it has the same measure as its arc AB.',
      'An inscribed angle has its vertex P on the circle and stands on the same arc: it is half the central angle.',
      'Every inscribed angle on the same arc is equal, wherever P sits on the other arc.',
    ],
    variables: [
      deg('c', 'c', 'Central angle (arc AB)', 1, 359),
      deg('i', 'i', 'Inscribed angle APB', 0.5, 179.5),
    ],
    rules: [
      rule(
        'i = c/2',
        '{i} = {c} ÷ 2',
        {
          i: [
            (v) => v.c! / 2,
            '{c} ÷ 2',
            'An inscribed angle is half the central angle on its arc.',
          ],
          c: [(v) => 2 * v.i!, '2 × {i}', 'The arc (central angle) is twice the inscribed angle.'],
        },
        (v) => v.i! - v.c! / 2,
      ),
    ],
    example: { c: 130, i: 65 },
    startWith: ['c'],
    representation: { kind: 'circleTheorems', theorem: 'inscribed', central: 'c', inscribed: 'i' },
  }),
  page({
    id: 'm.10.circle-theorems~semicircle',
    title: 'The angle in a semicircle',
    use: 'Use this for “AB is a diameter and m∠PAB = 34°. Find m∠PBA.”',
    assumptions: [
      'AB is a diameter, so its arc is 180° and the inscribed angle at P is half of it: 90°.',
      'So the other two angles of △APB add to 90°.',
      'Going the other way, an inscribed right angle always stands on a diameter.',
    ],
    variables: [deg('a', 'a', 'm∠PAB', 1, 89), deg('b', 'b', 'm∠PBA', 1, 89)],
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
    example: { a: 34, b: 56 },
    startWith: ['a'],
    representation: { kind: 'circleTheorems', theorem: 'semicircle', angle: 'a', other: 'b' },
  }),
  page({
    id: 'm.10.circle-theorems~tangent',
    title: 'A tangent and its radius',
    use: 'Use this for “The radius is 8 and the tangent from P is 15. How far is P from the center?”',
    assumptions: [
      'A tangent touches the circle at one point T, at right angles to the radius OT.',
      'So O, T and P make a right triangle with hypotenuse OP: r² + t² = d².',
      'The two tangents from one point are equal in length.',
    ],
    variables: [
      len('r', 'r', 'Radius OT'),
      len('t', 't', 'Tangent PT'),
      len('d', 'd', 'Distance OP', 1500),
    ],
    rules: [pythagoras('r', 't', 'd', 'OP is the hypotenuse of the right triangle OTP.')],
    example: { r: 8, t: 15, d: 17 },
    startWith: ['r', 't'],
    representation: {
      kind: 'circleTheorems',
      theorem: 'tangent',
      radius: 'r',
      tangent: 't',
      distance: 'd',
    },
  }),
  page({
    id: 'm.10.circle-theorems~chords',
    title: 'Two chords crossing',
    use: 'Use this for “Chords AB and CD cross at E; AE = 6, EB = 4 and CE = 3. Find ED.”',
    assumptions: [
      'Two chords cross at E inside the circle.',
      'The products of the parts of each chord are equal: AE × EB = CE × ED.',
    ],
    variables: [
      len('a', 'a', 'AE'),
      len('b', 'b', 'EB'),
      len('c', 'c', 'CE'),
      len('d', 'd', 'ED', 1e6),
    ],
    rules: [
      products('a', 'b', 'c', 'd', 'Crossing chords: the products of their parts are equal.'),
    ],
    example: { a: 6, b: 4, c: 3, d: 8 },
    startWith: ['a', 'b', 'c'],
    representation: { kind: 'circleTheorems', theorem: 'chords', segments: ['a', 'b', 'c', 'd'] },
  }),
  page({
    id: 'm.10.circle-theorems~secants',
    title: 'Two secants from a point',
    use: 'Use this for “From P, PA = 3 and PB = 10 on one secant, PC = 5 on the other. Find PD.”',
    assumptions: [
      'Two secants from P outside the circle: PA and PC are the outside parts, PB and PD the whole secants.',
      'Outside part × whole secant is the same for both: PA × PB = PC × PD.',
    ],
    variables: [
      len('a', 'a', 'PA (outside)'),
      len('b', 'b', 'PB (whole)', 1e6),
      len('c', 'c', 'PC (outside)'),
      len('d', 'd', 'PD (whole)', 1e6),
    ],
    rules: [
      limit(
        'PB > PA',
        '{b} is more than {a}',
        (v) => v.b! > v.a!,
        'A whole secant is longer than its outside part.',
      ),
      limit(
        'PD > PC',
        '{d} is more than {c}',
        (v) => v.d! > v.c!,
        'A whole secant is longer than its outside part.',
      ),
      products(
        'a',
        'b',
        'c',
        'd',
        'Two secants from one point: outside part × whole secant is equal.',
      ),
    ],
    example: { a: 3, b: 10, c: 5, d: 6 },
    startWith: ['a', 'b', 'c'],
    representation: { kind: 'circleTheorems', theorem: 'secants', segments: ['a', 'b', 'c', 'd'] },
  }),
  page({
    id: 'm.10.circle-theorems~secant-tangent',
    title: 'A tangent and a secant from a point',
    use: 'Use this for “From P, PA = 4 and PB = 16 on a secant. How long is the tangent PT?”',
    assumptions: [
      'From P, a tangent touches the circle at T and a secant crosses it at A and B.',
      'The tangent squared is outside part × whole secant: PT² = PA × PB.',
    ],
    variables: [
      len('t', 't', 'PT (tangent)'),
      len('a', 'a', 'PA (outside)'),
      len('b', 'b', 'PB (whole)', 1e6),
    ],
    rules: [
      limit(
        'PB > PA',
        '{b} is more than {a}',
        (v) => v.b! > v.a!,
        'A whole secant is longer than its outside part.',
      ),
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
            (v) => quot(v.t! ** 2, v.a!),
            '{t}² ÷ {a}',
            'The whole secant is the tangent squared over the outside part.',
          ],
          a: [
            (v) => quot(v.t! ** 2, v.b!),
            '{t}² ÷ {b}',
            'The outside part is the tangent squared over the whole secant.',
          ],
        },
        (v) => v.t! ** 2 - v.a! * v.b!,
      ),
    ],
    example: { t: 8, a: 4, b: 16 },
    startWith: ['a', 'b'],
    representation: { kind: 'circleTheorems', theorem: 'secantTangent', segments: ['t', 'a', 'b'] },
  }),
];

// ─── m.10.circle-equations ───────────────────────────────────────────────────

const rSquared = rule(
  'r² = r × r',
  '{q} = {r}²',
  {
    q: [(v) => v.r! ** 2, '{r}²', 'Square the radius for the right side.'],
    r: [(v) => root(v.q!), '√{q}', 'The radius is the square root of the right side.'],
  },
  (v) => v.q! - v.r! ** 2,
);

const CIRCLE_EQUATIONS: ModuleDef[] = [
  page({
    id: 'm.10.circle-equations',
    assumptions: [
      'Every point (x, y) on the circle is r from the center (h, k).',
      'The distance formula squared gives (x − h)² + (y − k)² = r².',
      'A center with a negative coordinate turns the minus into a plus: (y + 2)² has k = −2.',
    ],
    standalone: {
      vars: ['h', 'k'],
      why: 'The center only moves the circle; the right side comes from the radius alone.',
    },
    variables: [
      num('h', 'h', 'Center, x', -20, 20, { step: 0.5 }),
      num('k', 'k', 'Center, y', -20, 20, { step: 0.5 }),
      num('r', 'r', 'Radius', 0.1, 100, { step: 0.1 }),
      num('q', 'r²', 'Right side r²', 0.01, 10000),
    ],
    rules: [rSquared],
    example: { h: 3, k: -2, r: 5, q: 25 },
    startWith: ['h', 'k', 'r'],
    equation: '(x − {h})² + (y − {k})² = {q}',
    representation: { kind: 'conicGraph', conic: 'circle', h: 'h', k: 'k', r: 'r' },
  }),
  page({
    id: 'm.10.circle-equations~general-form',
    title: 'Center and radius from the general form',
    use: 'Use this for “Find the center and radius of x² + y² − 6x + 4y − 12 = 0.”',
    assumptions: [
      'Complete the square in x and in y: x² + Dx = (x + D/2)² − (D/2)².',
      'So the center is (−D ÷ 2, −E ÷ 2) and r² = h² + k² − F.',
      'When h² + k² − F is 0 or less, the equation has no circle.',
    ],
    variables: [
      num('D', 'D', 'Coefficient of x', -100, 100),
      num('E', 'E', 'Coefficient of y', -100, 100),
      num('F', 'F', 'Constant', -1000, 1000),
      der(num('h', 'h', 'Center, x', -50, 50)),
      der(num('k', 'k', 'Center, y', -50, 50)),
      der(num('r', 'r', 'Radius', 0, 200)),
    ],
    rules: [
      derive(
        'h = −D/2',
        '{h} = −{D} ÷ 2',
        'h',
        (v) => -v.D! / 2,
        '−{D} ÷ 2',
        'Half the x coefficient, with its sign changed, completes the square.',
      ),
      derive(
        'k = −E/2',
        '{k} = −{E} ÷ 2',
        'k',
        (v) => -v.E! / 2,
        '−{E} ÷ 2',
        'Half the y coefficient, with its sign changed, completes the square.',
      ),
      limit(
        'the equation is a circle',
        '{h}² + {k}² − {F} is more than 0',
        (v) => v.h! ** 2 + v.k! ** 2 - v.F! > 0,
        'h² + k² − F is 0 or less: this equation has no circle.',
      ),
      derive(
        'r = √(h² + k² − F)',
        '{r} = √({h}² + {k}² − {F})',
        'r',
        (v) => root(v.h! ** 2 + v.k! ** 2 - v.F!),
        '√({h}² + {k}² − {F})',
        'Move the squares’ extra terms and F to the right side: that is r².',
      ),
    ],
    example: { D: -6, E: 4, F: -12, h: 3, k: -2, r: 5 },
    startWith: ['D', 'E', 'F'],
    equation: 'x² + y² + {D}x + {E}y + {F} = 0',
    representation: { kind: 'conicGraph', conic: 'circle', h: 'h', k: 'k', r: 'r' },
  }),
  page({
    id: 'm.10.circle-equations~point',
    title: 'A point on the circle',
    use: 'Use this for “A circle has center (1, 2) and radius 5. Find x when the point (x, 5) is on it.”',
    assumptions: [
      'A point is on the circle when (x − h)² + (y − k)² = r².',
      'Given y, solve for x: x = h ± √(r² − (y − k)²). Two points share each height, mirrored across x = h.',
      'The radius is the distance from the center to any point on the circle.',
    ],
    variables: [
      num('h', 'h', 'Center, x', -20, 20, { step: 0.5 }),
      num('k', 'k', 'Center, y', -20, 20, { step: 0.5 }),
      num('r', 'r', 'Radius', 0.1, 100, { step: 0.1 }),
      num('x', 'x', 'Point, x', -120, 120),
      num('y', 'y', 'Point, y', -120, 120),
    ],
    rules: [
      rule(
        '(x − h)² + (y − k)² = r²',
        '({x} − {h})² + ({y} − {k})² = {r}²',
        {
          x: [
            (v) => {
              const d = v.r! ** 2 - (v.y! - v.k!) ** 2;
              return d < 0 ? undefined : [v.h! + Math.sqrt(d), v.h! - Math.sqrt(d)];
            },
            '{h} ± √({r}² − ({y} − {k})²)',
            'Solve the circle’s equation for x: two points at that height.',
          ],
          y: [
            (v) => {
              const d = v.r! ** 2 - (v.x! - v.h!) ** 2;
              return d < 0 ? undefined : [v.k! + Math.sqrt(d), v.k! - Math.sqrt(d)];
            },
            '{k} ± √({r}² − ({x} − {h})²)',
            'Solve the circle’s equation for y: two points above and below.',
          ],
          r: [
            (v) => Math.hypot(v.x! - v.h!, v.y! - v.k!),
            '√(({x} − {h})² + ({y} − {k})²)',
            'The radius is the distance from the center to the point.',
          ],
        },
        (v) => (v.x! - v.h!) ** 2 + (v.y! - v.k!) ** 2 - v.r! ** 2,
      ),
    ],
    example: { h: 1, k: 2, r: 5, y: 5, x: 5 },
    startWith: ['h', 'k', 'r', 'y'],
    representation: {
      kind: 'conicGraph',
      conic: 'circle',
      h: 'h',
      k: 'k',
      r: 'r',
      point: { x: 'x', y: 'y' },
    },
  }),
];

// ─── m.10.law-sines-cosines ──────────────────────────────────────────────────

/** Both angles (degrees, under 180°) with a sine of x. */
const asinBoth = (x: number) => {
  if (!(x > 0 && x <= 1 + 1e-12)) return undefined;
  const d = Math.asin(Math.min(1, x)) / RAD;
  return Math.abs(d - 90) < 1e-9 ? d : [d, 180 - d];
};
/** The angles with a sine that leave room for the angle `other` (under 180° together). */
function fitAngle(xs: number | number[] | undefined, other: number) {
  if (xs === undefined) return undefined;
  const ok = (Array.isArray(xs) ? xs : [xs]).filter((d) => d + other < 180 - 1e-9);
  return ok.length ? ok : undefined;
}
/** The side beside angle X from the side x across from it and the other side y beside it. */
function beside(x: number, y: number, X: number) {
  const d = x * x - (y * sin(X)) ** 2;
  if (d < -1e-12) return undefined;
  const r = Math.sqrt(Math.max(0, d));
  const out = [y * cos(X) + r, y * cos(X) - r].filter((s, i) => s > 1e-9 && (i === 0 || r > 1e-9));
  return out.length ? out : undefined;
}
/** x² = y² + z² − 2yz cos X, for the side x across from angle X between sides y and z. */
const cosines = (x: string, y: string, z: string, X: string) =>
  rule(
    `${x}² = ${y}² + ${z}² − 2${y}${z} cos ${X}`,
    `{${x}}² = {${y}}² + {${z}}² − 2 × {${y}} × {${z}} × cos({${X}})`,
    {
      [x]: [
        (v) => root(v[y]! ** 2 + v[z]! ** 2 - 2 * v[y]! * v[z]! * cos(v[X]!)),
        `√({${y}}² + {${z}}² − 2 × {${y}} × {${z}} × cos({${X}}))`,
        `Law of cosines: the two sides beside ${X} and the angle between them give the side across from it.`,
      ],
      [X]: [
        (v) => acosD((v[y]! ** 2 + v[z]! ** 2 - v[x]! ** 2) / (2 * v[y]! * v[z]!)),
        `cos⁻¹(({${y}}² + {${z}}² − {${x}}²) ÷ (2 × {${y}} × {${z}}))`,
        `Law of cosines turned round: three sides give the angle ${X}.`,
      ],
      [y]: [
        (v) => beside(v[x]!, v[z]!, v[X]!),
        `{${z}} × cos({${X}}) ± √({${x}}² − ({${z}} × sin({${X}}))²)`,
        `Law of cosines as a quadratic in ${y}: two lengths fit when both come out positive.`,
      ],
      [z]: [
        (v) => beside(v[x]!, v[y]!, v[X]!),
        `{${y}} × cos({${X}}) ± √({${x}}² − ({${y}} × sin({${X}}))²)`,
        `Law of cosines as a quadratic in ${z}: two lengths fit when both come out positive.`,
      ],
    },
    (v) => v[x]! ** 2 - (v[y]! ** 2 + v[z]! ** 2 - 2 * v[y]! * v[z]! * cos(v[X]!)),
  );
/** The angle X from its sine: sin⁻¹, or 180° − sin⁻¹ when the angle is obtuse. */
const inverseSine = (X: string, inner: string): [StepText['expr'], StepText['how']] => [
  (v) => (v[X]! > 90 ? `180 − sin⁻¹(${inner})` : `sin⁻¹(${inner})`),
  (v) =>
    v[X]! > 90
      ? 'Law of sines for the sine. The obtuse angle with that sine is 180° minus the inverse sine.'
      : 'Law of sines for the sine, then the inverse sine. An obtuse angle has the same sine: check which fits.',
];
/** x ÷ sin X = y ÷ sin Y. */
const sines = (x: string, X: string, y: string, Y: string): Rule => {
  const r = rule(
    `${x}/sin ${X} = ${y}/sin ${Y}`,
    `{${x}} ÷ sin({${X}}) = {${y}} ÷ sin({${Y}})`,
    {
      [x]: [
        (v) => quot(v[y]! * sin(v[X]!), sin(v[Y]!)),
        `{${y}} × sin({${X}}) ÷ sin({${Y}})`,
        'Law of sines: multiply both sides by the sine of the angle across from the side.',
      ],
      [y]: [
        (v) => quot(v[x]! * sin(v[Y]!), sin(v[X]!)),
        `{${x}} × sin({${Y}}) ÷ sin({${X}})`,
        'Law of sines: multiply both sides by the sine of the angle across from the side.',
      ],
      [X]: [
        (v) => fitAngle(asinBoth((v[x]! * sin(v[Y]!)) / v[y]!), v[Y]!),
        ...inverseSine(X, `{${x}} × sin({${Y}}) ÷ {${y}}`),
      ],
      [Y]: [
        (v) => fitAngle(asinBoth((v[y]! * sin(v[X]!)) / v[x]!), v[X]!),
        ...inverseSine(Y, `{${y}} × sin({${X}}) ÷ {${x}}`),
      ],
    },
    (v) => v[x]! * sin(v[Y]!) - v[y]! * sin(v[X]!),
  );
  r.relation.message = (v: Values) => {
    const [s, t, T] = v[X] === undefined ? [x, y, Y] : [y, x, X];
    if (v[t] === undefined || v[T] === undefined || v[s] === undefined) return undefined;
    return v[s]! * sin(v[T]!) > v[t]! + 1e-9
      ? `${s} × sin ${T} is longer than ${t}: ${t} can’t reach the third side, so no triangle fits.`
      : undefined;
  };
  return r;
};
const angleSum = rule(
  'A + B + C = 180°',
  '{A} + {B} + {C} = 180',
  {
    A: [(v) => 180 - v.B! - v.C!, '180 − {B} − {C}', 'The angles of a triangle add to 180°.'],
    B: [(v) => 180 - v.A! - v.C!, '180 − {A} − {C}', 'The angles of a triangle add to 180°.'],
    C: [(v) => 180 - v.A! - v.B!, '180 − {A} − {B}', 'The angles of a triangle add to 180°.'],
  },
  (v) => v.A! + v.B! + v.C! - 180,
);
const TRIANGLE_VARS: VariableDef[] = [
  len('a', 'a', 'Side a', 1000, { min: 0.1 }),
  len('b', 'b', 'Side b', 1000, { min: 0.1 }),
  len('c', 'c', 'Side c', 1000, { min: 0.1 }),
  deg('A', 'A', 'Angle A', 1, 178),
  deg('B', 'B', 'Angle B', 1, 178),
  deg('C', 'C', 'Angle C', 1, 178),
];
const LAWS = [
  'The sides a, b and c are across from the angles A, B and C.',
  'Law of sines: a ÷ sin A = b ÷ sin B = c ÷ sin C. Law of cosines: c² = a² + b² − 2ab cos C.',
];
/** A triangle solved from any three parts with a side among them. */
const anyTriangle = (d: {
  id: string;
  title: string;
  use: string;
  assumptions: string[];
  example: Values;
  startWith: string[];
}) =>
  page({
    ...d,
    variables: TRIANGLE_VARS,
    rules: [
      angleSum,
      closes('a', 'b', 'c'),
      cosines('a', 'b', 'c', 'A'),
      cosines('b', 'a', 'c', 'B'),
      cosines('c', 'a', 'b', 'C'),
      sines('a', 'A', 'b', 'B'),
      sines('b', 'B', 'c', 'C'),
      sines('a', 'A', 'c', 'C'),
    ],
    representation: {
      kind: 'triangleSolver',
      parts: { a: 'a', b: 'b', c: 'c', A: 'A', B: 'B', C: 'C' },
    },
  });
/** A consistent triangle from two sides and the angle between them, or from three sides. */
function fromSas(b: number, c: number, A: number): Values {
  const a = Math.sqrt(b * b + c * c - 2 * b * c * cos(A));
  const B = Math.acos((a * a + c * c - b * b) / (2 * a * c)) / RAD;
  return { a, b, c, A, B, C: 180 - A - B };
}
function fromSss(a: number, b: number, c: number): Values {
  const A = Math.acos((b * b + c * c - a * a) / (2 * b * c)) / RAD;
  const B = Math.acos((a * a + c * c - b * b) / (2 * a * c)) / RAD;
  return { a, b, c, A, B, C: 180 - A - B };
}

const LAW_SINES_COSINES: ModuleDef[] = [
  page({
    id: 'm.10.law-sines-cosines',
    assumptions: [
      'Each side is across from the angle with the same letter.',
      'A side divided by the sine of its angle is the same for all three sides.',
      'Two angles and any side (AAS or ASA): find the third angle from 180° first.',
    ],
    variables: TRIANGLE_VARS,
    rules: [
      angleSum,
      closes('a', 'b', 'c'),
      sines('a', 'A', 'b', 'B'),
      sines('b', 'B', 'c', 'C'),
      sines('a', 'A', 'c', 'C'),
    ],
    example: {
      A: 35,
      B: 80,
      C: 65,
      a: 9,
      b: (9 * sin(80)) / sin(35),
      c: (9 * sin(65)) / sin(35),
    },
    startWith: ['a', 'A', 'B'],
    equation: '{a}/{sin({A}°)} = {b}/{sin({B}°)}',
    representation: {
      kind: 'triangleSolver',
      parts: { a: 'a', b: 'b', c: 'c', A: 'A', B: 'B', C: 'C' },
    },
  }),
  anyTriangle({
    id: 'm.10.law-sines-cosines~sas',
    title: 'Two sides and the angle between them',
    use: 'Use this for “b = 7, c = 10 and A = 50°. Find a.”',
    assumptions: [
      ...LAWS,
      'Two sides and the angle between them: the law of cosines gives the third side first.',
    ],
    example: fromSas(7, 10, 50),
    startWith: ['b', 'c', 'A'],
  }),
  anyTriangle({
    id: 'm.10.law-sines-cosines~sss',
    title: 'Three sides: find an angle',
    use: 'Use this for “The sides are 5, 7 and 9. Find the largest angle.”',
    assumptions: [
      ...LAWS,
      'Three sides: turn the law of cosines round, cos C = (a² + b² − c²) ÷ (2ab).',
    ],
    example: fromSss(5, 7, 9),
    startWith: ['a', 'b', 'c'],
  }),
  anyTriangle({
    id: 'm.10.law-sines-cosines~ambiguous-case',
    title: 'The ambiguous case (SSA)',
    use: 'Use this for “A = 30°, a = 6 and b = 10. How many triangles fit, and what is B?”',
    assumptions: [
      ...LAWS,
      'Two sides and an angle across from one of them can fit two triangles, one or none.',
      'a ≥ b gives one triangle; a less than b × sin A gives none.',
    ],
    example: (() => {
      const B = asinD((10 * sin(30)) / 6)!;
      const C = 180 - 30 - B;
      return { a: 6, b: 10, A: 30, B, C, c: (6 * sin(C)) / sin(30) };
    })(),
    startWith: ['a', 'b', 'A'],
  }),
  page({
    id: 'm.10.law-sines-cosines~area',
    title: 'Area from two sides and the angle between them',
    use: 'Use this for “Two sides of a triangle are 8 and 11 with a 40° angle between them. Find its area.”',
    assumptions: [
      'The height to side a is b × sin C, so the area is ½ × a × b × sin C.',
      'C must be the angle between the two sides.',
    ],
    variables: [
      len('a', 'a', 'Side a', 1000, { min: 0.1 }),
      len('b', 'b', 'Side b', 1000, { min: 0.1 }),
      deg('C', 'C', 'Angle C between them', 1, 178),
      num('K', 'K', 'Area', 0.0001, 1e6),
    ],
    rules: [
      rule(
        'K = ½ab sin C',
        '{K} = {a} × {b} × sin({C}) ÷ 2',
        {
          K: [
            (v) => (v.a! * v.b! * sin(v.C!)) / 2,
            '{a} × {b} × sin({C}) ÷ 2',
            'Half the base times the height, and the height is b × sin C.',
          ],
          a: [
            (v) => quot(2 * v.K!, v.b! * sin(v.C!)),
            '2 × {K} ÷ ({b} × sin({C}))',
            'Undo the half, then divide by b × sin C.',
          ],
          b: [
            (v) => quot(2 * v.K!, v.a! * sin(v.C!)),
            '2 × {K} ÷ ({a} × sin({C}))',
            'Undo the half, then divide by a × sin C.',
          ],
        },
        (v) => v.K! - (v.a! * v.b! * sin(v.C!)) / 2,
      ),
    ],
    example: { a: 8, b: 11, C: 40, K: 44 * sin(40) },
    startWith: ['a', 'b', 'C'],
    representation: { kind: 'triangleSolver', parts: { a: 'a', b: 'b', C: 'C' } },
  }),
];

// ─── m.10.probability-rules ──────────────────────────────────────────────────

/** n! for a whole n. */
const fact = (n: number) => {
  let out = 1;
  for (let i = 2; i <= n; i++) out *= i;
  return out;
};
/** C(n, r), the ways to choose r of n. */
const choose = (n: number, r: number) => {
  if (r < 0 || r > n) return 0;
  let out = 1;
  for (let i = 1; i <= r; i++) out = (out * (n - r + i)) / i;
  return Math.round(out);
};
/** One shaded probability on a Venn diagram of P(A), P(B) and P(A and B). */
function vennPage(d: {
  id: string;
  title?: string;
  use?: string;
  assumptions: string[];
  names: [string, string];
  shade: 'or' | 'notA' | 'neither';
  result: { symbol: string; name: string; display: string; fn: (v: Values) => number; how: string };
  example: Values;
  exclusive?: boolean;
}): ModuleDef {
  const [A, B] = d.names;
  const expr = d.result.display.replace(/^\{s\} = /, '');
  return page({
    id: d.id,
    ...(d.title ? { title: d.title, use: d.use } : {}),
    assumptions: d.assumptions,
    variables: [
      chance('a', `P(${A})`, `P(${A})`),
      chance('b', `P(${B})`, `P(${B})`),
      ...(d.exclusive ? [] : [chance('ab', `P(${A} and ${B})`, `P(${A} and ${B})`)]),
      chanceOut('s', d.result.symbol, d.result.name),
    ],
    rules: [
      ...(d.exclusive
        ? [
            limit(
              'P(A) + P(B) ≤ 1',
              '{a} + {b} is at most 1',
              (v) => v.a! + v.b! <= 1 + 1e-9,
              'Events that can’t happen together can’t have chances adding past 1.',
            ),
          ]
        : vennFits),
      derive(
        d.result.display.replace(/[{}]/g, ''),
        d.result.display,
        's',
        (v) => {
          const x = d.result.fn(v);
          return x >= -1e-9 && x <= 1 + 1e-9 ? x : undefined;
        },
        expr,
        d.result.how,
      ),
    ],
    example: d.example,
    startWith: d.exclusive ? ['a', 'b'] : ['a', 'b', 'ab'],
    representation: {
      kind: 'venn',
      chances: {
        a: 'a',
        b: 'b',
        both: d.exclusive ? 0 : 'ab',
        names: d.names,
        shade: d.shade,
        ...(d.exclusive ? { exclusive: true } : {}),
        result: 's',
      },
    },
  });
}
/** P(n, r) or C(n, r) from n and r. */
function countingPage(kind: 'P' | 'C'): ModuleDef {
  const perm = kind === 'P';
  return page({
    id: `m.10.probability-rules~${perm ? 'permutations' : 'combinations'}`,
    title: perm ? 'Permutations: order matters' : 'Combinations: order doesn’t matter',
    use: perm
      ? 'Use this for “In how many ways can 8 runners take gold, silver and bronze?”'
      : 'Use this for “In how many ways can a committee of 3 be chosen from 8 people?”',
    assumptions: perm
      ? [
          'The first place can go to any of the n; each later place has one fewer choice.',
          'So P(n, r) = n × (n − 1) × … for r places = n! ÷ (n − r)!.',
          'Order matters: gold to Ana and silver to Ben differs from the other way round.',
        ]
      : [
          'Fill r places in order, then divide by the r! orders each group can be listed in.',
          'So C(n, r) = n! ÷ ((n − r)! × r!).',
          'Order doesn’t matter: a committee of Ana and Ben is the same as Ben and Ana.',
        ],
    variables: [
      num('n', 'n', 'Choices', 1, perm ? 14 : 12, { step: 1, integer: true }),
      num('r', 'r', perm ? 'Places filled in order' : 'Chosen', 0, perm ? 14 : 12, {
        step: 1,
        integer: true,
      }),
      der(num('c', kind, perm ? 'Ways' : 'Groups', 1, 1e19, { integer: true })),
    ],
    rules: [
      limit(
        'r ≤ n',
        '{r} is at most {n}',
        (v) => v.r! <= v.n!,
        'You can’t choose more than there are.',
      ),
      perm
        ? derive(
            'P = n! ÷ (n − r)!',
            '{c} = {n}! ÷ ({n} − {r})!',
            'c',
            (v) => fact(v.n!) / fact(v.n! - v.r!),
            '{n}! ÷ ({n} − {r})!',
            'n × (n − 1) × … for r places: n! with the unused (n − r)! divided out.',
          )
        : derive(
            'C = n! ÷ ((n − r)! × r!)',
            '{c} = {n}! ÷ (({n} − {r})! × {r}!)',
            'c',
            (v) => choose(v.n!, v.r!),
            '{n}! ÷ (({n} − {r})! × {r}!)',
            'The ordered count, n! ÷ (n − r)!, divided by the r! orders of each group.',
          ),
    ],
    example: { n: 8, r: 3, c: perm ? 336 : 56 },
    startWith: ['n', 'r'],
    sliders: true,
    equation: `${kind}({n}, {r}) = {c}`,
    representation: {
      kind: 'pascalTriangle',
      n: 'n',
      ...(perm ? { triangle: false } : { k: 'r' }),
      slots: { r: 'r', ...(perm ? {} : { choose: true }), result: 'c' },
    },
  });
}

const PROBABILITY_RULES: ModuleDef[] = [
  vennPage({
    id: 'm.10.probability-rules',
    assumptions: [
      'P(A) and P(B) both count the overlap, so it is taken off once.',
      'Each region shows its own probability; the whole rectangle is 1.',
      'The shaded union is every outcome in A, in B or in both.',
    ],
    names: ['Band', 'Sport'],
    shade: 'or',
    result: {
      symbol: 'P(Band or Sport)',
      name: 'P(Band or Sport)',
      display: '{s} = {a} + {b} − {ab}',
      fn: (v) => v.a! + v.b! - v.ab!,
      how: 'Add the two, then take off the overlap counted twice.',
    },
    example: { a: 0.45, b: 0.3, ab: 0.12, s: 0.63 },
  }),
  vennPage({
    id: 'm.10.probability-rules~exclusive',
    title: 'Mutually exclusive events',
    use: 'Use this for “P(red) = 0.25 and P(blue) = 0.40 for one marble. Find P(red or blue).”',
    assumptions: [
      'Mutually exclusive events share no outcome: P(A and B) = 0.',
      'Their circles don’t overlap, so nothing is counted twice.',
      'So P(A or B) = P(A) + P(B).',
    ],
    names: ['Red', 'Blue'],
    shade: 'or',
    result: {
      symbol: 'P(Red or Blue)',
      name: 'P(Red or Blue)',
      display: '{s} = {a} + {b}',
      fn: (v) => v.a! + v.b!,
      how: 'Nothing is shared, so just add the two.',
    },
    example: { a: 0.25, b: 0.4, s: 0.65 },
    exclusive: true,
  }),
  vennPage({
    id: 'm.10.probability-rules~complement',
    title: 'The complement rule',
    use: 'Use this for “The chance of rain is 0.35. What is the chance of no rain?”',
    assumptions: [
      'Everything outside A is the complement of A, written A′ or “not A”.',
      'A and not A together fill the rectangle, whose probability is 1.',
      'So P(not A) = 1 − P(A).',
    ],
    names: ['Rain', 'Wind'],
    shade: 'notA',
    result: {
      symbol: 'P(not Rain)',
      name: 'P(not Rain)',
      display: '{s} = 1 − {a}',
      fn: (v) => 1 - v.a!,
      how: 'Everything outside A: take P(A) from 1.',
    },
    example: { a: 0.35, b: 0.4, ab: 0.2, s: 0.65 },
  }),
  vennPage({
    id: 'm.10.probability-rules~neither',
    title: 'Neither event',
    use: 'Use this for “P(band) = 0.45, P(sport) = 0.30, P(both) = 0.12. What is the chance of neither?”',
    assumptions: [
      'Outside both circles is neither A nor B.',
      'First find P(A or B) by the addition rule.',
      'Then the rest of the rectangle is 1 − P(A or B).',
    ],
    names: ['Band', 'Sport'],
    shade: 'neither',
    result: {
      symbol: 'P(neither)',
      name: 'P(neither)',
      display: '{s} = 1 − ({a} + {b} − {ab})',
      fn: (v) => 1 - (v.a! + v.b! - v.ab!),
      how: 'Everything outside the union: take P(A or B) from 1.',
    },
    example: { a: 0.45, b: 0.3, ab: 0.12, s: 0.37 },
  }),
  page({
    id: 'm.10.probability-rules~sample-space',
    title: 'Listing equally likely outcomes',
    use: 'Use this for “Three coins are tossed. What is the chance of exactly two heads?”',
    assumptions: [
      'A tree lists every outcome: each branch splits into every outcome of the next stage.',
      'When every path is equally likely, P(event) = favorable outcomes ÷ all outcomes.',
      'Three coins, 1 for heads and 2 for tails: 1-1-2, 1-2-1 and 2-1-1 are exactly two heads, 3 of 8.',
    ],
    variables: [
      num('a', 'a', 'First-stage outcomes', 2, 4, { step: 1, integer: true }),
      num('b', 'b', 'Second-stage outcomes', 2, 4, { step: 1, integer: true }),
      num('c', 'c', 'Third-stage outcomes', 2, 4, { step: 1, integer: true }),
      der(num('n', 'n', 'Outcomes in all', 1, 64, { integer: true })),
      num('f', 'f', 'Favorable outcomes', 0, 64, { step: 1, integer: true }),
      der(num('P', 'P', 'Probability', 0, 1, { fraction: 64 })),
    ],
    rules: [
      derive(
        'n = a × b × c',
        '{n} = {a} × {b} × {c}',
        'n',
        (v) => v.a! * v.b! * v.c!,
        '{a} × {b} × {c}',
        'Each branch splits into every outcome of the next stage: multiply.',
      ),
      limit(
        'f ≤ n',
        '{f} is at most {n}',
        (v) => v.f! <= v.n!,
        'There can’t be more favorable outcomes than outcomes.',
      ),
      share('P', 'f', 'n', 'Favorable outcomes over all the equally likely outcomes.'),
    ],
    example: { a: 2, b: 2, c: 2, n: 8, f: 3, P: 0.375 },
    startWith: ['a', 'b', 'c', 'f'],
    representation: {
      kind: 'treeDiagram',
      first: 'a',
      second: 'b',
      third: 'c',
      total: 'n',
      names: [
        ['1', '2', '3', '4'],
        ['1', '2', '3', '4'],
        ['1', '2', '3', '4'],
      ],
      stages: ['First', 'Second', 'Third'],
      path: [0, 0, 1],
    },
  }),
  countingPage('P'),
  countingPage('C'),
  page({
    id: 'm.10.probability-rules~counting-probability',
    title: 'Probability with combinations',
    use: 'Use this for “3 students are picked at random from 5 girls and 4 boys. What is the chance all 3 are girls?”',
    assumptions: [
      'Every group of r is equally likely, so count groups with combinations.',
      'Favorable groups: C(a, r) ways to pick all r from the first group.',
      'All groups: C(a + b, r). The probability is the first over the second.',
    ],
    variables: [
      num('a', 'a', 'First group', 1, 12, { step: 1, integer: true }),
      num('b', 'b', 'Second group', 0, 11, { step: 1, integer: true }),
      num('r', 'r', 'Chosen', 1, 12, { step: 1, integer: true }),
      der(num('n', 'n', 'Everyone', 1, 12, { integer: true })),
      der(num('f', 'f', 'Groups all from the first', 0, 1000, { integer: true })),
      der(num('t', 't', 'Groups in all', 1, 1000, { integer: true })),
      der(num('P', 'P', 'Probability', 0, 1, { fraction: 1000 })),
    ],
    rules: [
      limit(
        'a + b ≤ 12',
        '{a} + {b} is at most 12',
        (v) => v.a! + v.b! <= 12,
        'Keep to 12 people in all, so the triangle can show them.',
      ),
      limit(
        'r ≤ a',
        '{r} is at most {a}',
        (v) => v.r! <= v.a!,
        'Choose no more than the first group has.',
      ),
      total('n', ['a', 'b'], 'Everyone in both groups.'),
      derive(
        'f = C(a, r)',
        '{f} = C({a}, {r})',
        'f',
        (v) => choose(v.a!, v.r!),
        'C({a}, {r})',
        'The ways to choose all r from the first group.',
      ),
      derive(
        't = C(n, r)',
        '{t} = C({n}, {r})',
        't',
        (v) => choose(v.n!, v.r!),
        'C({n}, {r})',
        'The ways to choose any r from everyone.',
      ),
      share('P', 'f', 't', 'Favorable groups over all the equally likely groups.'),
    ],
    example: { a: 5, b: 4, r: 3, n: 9, f: 10, t: 84, P: 10 / 84 },
    startWith: ['a', 'b', 'r'],
    representation: {
      kind: 'pascalTriangle',
      n: 'n',
      k: 'r',
      slots: { r: 'r', choose: true, result: 't' },
    },
  }),
];

// ─── m.10.constructions ──────────────────────────────────────────────────────

/** p·x + q = r·x + s solved for x (the letter on both sides). */
const bothSides = (x: string) => {
  const r = rule(
    `${x}: px + q = rx + s`,
    `{p} × {${x}} + {q} = {r} × {${x}} + {s}`,
    {
      [x]: [
        (v) => quot(v.s! - v.q!, v.p! - v.r!),
        '({s} − {q}) ÷ ({p} − {r})',
        'Take the same x and the same number from both sides, then divide by the x left.',
      ],
    },
    (v) => v.p! * v[x]! + v.q! - (v.r! * v[x]! + v.s!),
    {
      message: (v: Values) =>
        v.p === v.r && v.p !== undefined
          ? 'The x terms are the same on both sides, so no single x makes them equal.'
          : undefined,
    },
  );
  const fmt = (n: number) => formatNumber(n);
  // "3x", "x", "−x"; a negative is added back ("Add 7"), never "Take −7".
  const xs = (k: number) => (k === 1 ? 'x' : k === -1 ? '−x' : `${fmt(k)}x`);
  const move = (k: number, text: (n: number) => string) =>
    k < 0 ? `Add ${text(-k)} to both sides` : `Take ${text(k)} from both sides`;
  r.steps[x]!.work = (v: Values) => {
    const left = v.p! - v.r!;
    const plus = v.q! < 0 ? ` − ${fmt(-v.q!)}` : v.q! > 0 ? ` + ${fmt(v.q!)}` : '';
    return [
      `${move(v.r!, xs)}: ${xs(left)}${plus} = ${fmt(v.s!)}`,
      ...(v.q ? [`${move(v.q!, fmt)}: ${xs(left)} = ${fmt(v.s! - v.q!)}`] : []),
    ];
  };
  r.steps[x]!.written = false;
  return r;
};
const coefficient = (id: string, name: string) =>
  num(id, id, name, 1, 20, { step: 1, integer: true });
const constant = (id: string, name: string, lim: number) =>
  num(id, id, name, -lim, lim, { step: 1, integer: true });

const CONSTRUCTIONS: ModuleDef[] = [
  page({
    id: 'm.10.constructions',
    assumptions: [
      'B is on segment AC, between A and C.',
      'Then the two parts add to the whole: AB + BC = AC (the Segment Addition Postulate).',
      'Lengths add only along one line: with B off the line, AB + BC is more than AC.',
    ],
    variables: [
      len('ab', 'AB', 'AB', 1000, { unit: 'cm', min: 0.1 }),
      len('bc', 'BC', 'BC', 1000, { unit: 'cm', min: 0.1 }),
      len('ac', 'AC', 'AC', 2000, { unit: 'cm', min: 0.2 }),
    ],
    rules: [sum('ac', 'ab', 'bc', 'The two parts of the segment add to the whole.')],
    example: { ab: 4.5, bc: 7, ac: 11.5 },
    startWith: ['ab', 'bc'],
    representation: {
      kind: 'markedFigure',
      points: { A: [0, 0], B: ['ab', 0], C: ['ac', 0] },
      parts: [
        { segment: 'AC' },
        { label: 'AB', value: 'ab' },
        { label: 'BC', value: 'bc' },
        { label: 'AC', value: 'ac', inCaption: true },
      ],
    },
  }),
  page({
    id: 'm.10.constructions~midpoint',
    title: 'Midpoint with an unknown',
    use: 'Use this for “M is the midpoint of AC, AM = 3x + 1 and MC = 5x − 7. Find x, AM and AC.”',
    assumptions: [
      'M is the midpoint, so AM = MC: set the two expressions equal and solve for x.',
      'Put x back into AM, then AC is twice AM.',
      'A length can’t be 0 or less, so check AM is positive.',
    ],
    variables: [
      coefficient('p', 'x coefficient of AM'),
      constant('q', 'Number in AM', 50),
      coefficient('r', 'x coefficient of MC'),
      constant('s', 'Number in MC', 50),
      der(num('x', 'x', 'x', -1000, 1000)),
      der(num('am', 'AM', 'AM', 0.001, 100000)),
      der(num('ac', 'AC', 'AC', 0.002, 200000)),
    ],
    rules: [
      bothSides('x'),
      derive(
        'AM = px + q',
        '{am} = {p} × {x} + {q}',
        'am',
        (v) => v.p! * v.x! + v.q!,
        '{p} × {x} + {q}',
        'Put x back into AM.',
      ),
      limit(
        'AM > 0',
        '{am} is more than 0',
        (v) => v.am! > 0,
        'A length can’t be 0 or less: this x gives no segment.',
      ),
      derive(
        'AC = 2 × AM',
        '{ac} = 2 × {am}',
        'ac',
        (v) => 2 * v.am!,
        '2 × {am}',
        'M is the middle, so AC is twice AM.',
      ),
    ],
    example: { p: 3, q: 1, r: 5, s: -7, x: 4, am: 13, ac: 26 },
    startWith: ['p', 'q', 'r', 's'],
    equation: '{p}x + {q} = {r}x + {s}',
    representation: {
      kind: 'markedFigure',
      points: { A: [0, 0], M: ['am', 0], C: ['ac', 0] },
      parts: [
        { segment: 'AC' },
        { ticks: 'AM', count: 1 },
        { ticks: 'MC', count: 1 },
        { label: 'AM', value: 'am' },
        { label: 'AC', value: 'ac', inCaption: true },
      ],
    },
  }),
  page({
    id: 'm.10.constructions~angle-addition',
    title: 'Angle addition',
    use: 'Use this for “m∠AOB = 38° and m∠BOC = 47°. Find m∠AOC.”',
    assumptions: [
      'Ray OB is inside ∠AOC, so the two angles add to the whole: m∠AOB + m∠BOC = m∠AOC.',
      'A bisector cuts the angle into two equal halves: then m∠AOB = m∠BOC.',
    ],
    variables: [
      deg('a', 'm∠AOB', 'm∠AOB', 0.1, 359.9),
      deg('b', 'm∠BOC', 'm∠BOC', 0.1, 359.9),
      deg('c', 'm∠AOC', 'm∠AOC', 0.2, 360),
    ],
    rules: [sum('c', 'a', 'b', 'The two angles side by side add to the whole angle.')],
    example: { a: 38, b: 47, c: 85 },
    startWith: ['a', 'b'],
    equation: '{a}° + {b}° = {c}°',
    representation: { kind: 'angles', parts: ['a', 'b'], whole: 'c' },
  }),
  page({
    id: 'm.10.constructions~perpendicular-bisector',
    title: 'Construct a perpendicular bisector',
    use: 'Use this for “Construct the perpendicular bisector of a 6 cm segment with the compass open to 4 cm.”',
    assumptions: [
      'Open the compass wider than half of AB; draw an arc from A and one from B.',
      'The arcs cross at P, the same distance r from A and B. The line through P at right angles to AB bisects it at M.',
      'P is h above M, and the right triangle AMP gives h² + AM² = r².',
    ],
    variables: [
      len('ab', 'AB', 'Segment AB', 1000, { unit: 'cm', min: 0.1 }),
      len('r', 'r', 'Compass opening r', 1000, { unit: 'cm', min: 0.1 }),
      der(len('m', 'AM', 'AM', 500, { unit: 'cm' })),
      der(len('h', 'MP', 'MP', 1000, { unit: 'cm' })),
    ],
    rules: [
      derive(
        'AM = AB/2',
        '{m} = {ab} ÷ 2',
        'm',
        (v) => v.ab! / 2,
        '{ab} ÷ 2',
        'M is the middle of AB.',
      ),
      limit(
        'r > AM',
        '{r} is more than {m}',
        (v) => v.r! > v.m!,
        'The compass must open more than half of AB, or the arcs miss each other.',
      ),
      derive(
        'MP² = r² − AM²',
        '{h}² = {r}² − {m}²',
        'h',
        (v) => root(v.r! ** 2 - v.m! ** 2),
        '√({r}² − {m}²)',
        'The right triangle AMP: the compass opening r is its hypotenuse.',
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
        { label: 'AM', value: 'm' },
        { label: 'MP', value: 'h', inCaption: true },
        { label: 'AP', value: 'r' },
      ],
    },
  }),
];

// ─── m.10.proofs ─────────────────────────────────────────────────────────────

const PROOFS: ModuleDef[] = [
  page({
    id: 'm.10.proofs~exterior-angle',
    title: 'Triangle angle sum and exterior angle',
    use: 'Use this for “Side BC is extended to D. m∠A = 52° and m∠B = 71°. Find m∠ACD and m∠ACB.”',
    assumptions: [
      'The three angles of a triangle add to 180°.',
      'The exterior angle ∠ACD and ∠ACB make a straight line, so they add to 180°.',
      'So the exterior angle equals the two remote interior angles added: m∠ACD = m∠A + m∠B.',
    ],
    variables: [
      deg('a', 'm∠A', 'm∠A', 0.1, 179.8),
      deg('b', 'm∠B', 'm∠B', 0.1, 179.8),
      deg('c', 'm∠ACB', 'm∠ACB', 0.1, 179.8),
      deg('d', 'm∠ACD', 'm∠ACD', 0.2, 179.9),
    ],
    rules: [
      rule(
        'A + B + ACB = 180°',
        '{a} + {b} + {c} = 180',
        {
          c: [(v) => 180 - v.a! - v.b!, '180 − {a} − {b}', 'The angles of a triangle add to 180°.'],
          a: [(v) => 180 - v.b! - v.c!, '180 − {b} − {c}', 'The angles of a triangle add to 180°.'],
          b: [(v) => 180 - v.a! - v.c!, '180 − {a} − {c}', 'The angles of a triangle add to 180°.'],
        },
        (v) => v.a! + v.b! + v.c! - 180,
      ),
      sum('d', 'a', 'b', 'The exterior angle equals the two remote interior angles added.'),
    ],
    example: { a: 52, b: 71, c: 57, d: 123 },
    startWith: ['a', 'b'],
    representation: { kind: 'angles', parts: ['a', 'b'], whole: 'd', triangle: { third: 'c' } },
  }),
];

// ─── m.10.parallel-lines ─────────────────────────────────────────────────────

/** y = 180° − x (a linear pair, or same-side interior angles), both ways. */
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
/** y = x (equal angles), both ways. */
const equal = (x: string, y: string, why: string) =>
  rule(
    `${y} = ${x}`,
    `{${y}} = {${x}}`,
    { [y]: [(v) => v[x]!, `{${x}}`, why], [x]: [(v) => v[y]!, `{${y}}`, why] },
    (v) => v[y]! - v[x]!,
  );
const PARALLEL_GIVEN = 'Lines ℓ and m are parallel, and the transversal crosses both.';

const PARALLEL_LINES: ModuleDef[] = [
  page({
    id: 'm.10.parallel-lines',
    assumptions: [
      PARALLEL_GIVEN,
      'Corresponding angles sit in the same position at each crossing: 1 and 5, 2 and 6, 3 and 7, 4 and 8.',
      'When the lines are parallel, corresponding angles are congruent.',
    ],
    variables: [deg('x', 'm∠1', 'm∠1', 1, 179), deg('y', 'm∠5', 'm∠5', 1, 179)],
    rules: [equal('x', 'y', 'Parallel lines: corresponding angles are congruent.')],
    example: { x: 62, y: 62 },
    startWith: ['x'],
    representation: {
      kind: 'markedFigure',
      transversal: { angle: 'x', second: 'y', highlight: [1, 5], labels: { 1: 'x', 5: 'y' } },
    },
  }),
  page({
    id: 'm.10.parallel-lines~alternate-interior',
    title: 'Alternate interior angles',
    use: 'Use this for “ℓ ∥ m and m∠1 = 118°. Find m∠3 and m∠6.”',
    assumptions: [
      PARALLEL_GIVEN,
      'Angles 1 and 3 make a straight line, so they add to 180°.',
      'Alternate interior angles (3 and 6, 4 and 5) are between the lines on opposite sides of the transversal; they are congruent.',
    ],
    variables: [
      deg('a', 'm∠1', 'm∠1', 1, 179),
      deg('x', 'm∠3', 'm∠3', 1, 179),
      deg('y', 'm∠6', 'm∠6', 1, 179),
    ],
    rules: [
      supplement('a', 'x', 'A linear pair adds to 180°.'),
      equal('x', 'y', 'Parallel lines: alternate interior angles are congruent.'),
    ],
    example: { a: 118, x: 62, y: 62 },
    startWith: ['a'],
    representation: {
      kind: 'markedFigure',
      transversal: { angle: 'a', highlight: [3, 6], labels: { 1: 'a', 3: 'x', 6: 'y' } },
    },
  }),
  page({
    id: 'm.10.parallel-lines~same-side',
    title: 'Same-side interior angles',
    use: 'Use this for “ℓ ∥ m and m∠4 = 73°. Find m∠6.”',
    assumptions: [
      PARALLEL_GIVEN,
      'Same-side interior angles (3 and 5, 4 and 6) are between the lines on one side of the transversal; they add to 180°.',
      'Angles 1 and 4 are vertical angles, so they are congruent.',
    ],
    variables: [
      deg('a', 'm∠1', 'm∠1', 1, 179),
      deg('x', 'm∠4', 'm∠4', 1, 179),
      deg('y', 'm∠6', 'm∠6', 1, 179),
    ],
    rules: [
      equal('a', 'x', 'Vertical angles are congruent.'),
      supplement('x', 'y', 'Parallel lines: same-side interior angles add to 180°.'),
    ],
    example: { a: 73, x: 73, y: 107 },
    startWith: ['x'],
    representation: {
      kind: 'markedFigure',
      transversal: { angle: 'a', highlight: [4, 6], labels: { 1: 'a', 4: 'x', 6: 'y' } },
    },
  }),
  page({
    id: 'm.10.parallel-lines~converse',
    title: 'Are the lines parallel?',
    use: 'Use this for “m∠1 = 81° and m∠5 = 79°. Are lines ℓ and m parallel?”',
    assumptions: [
      'Converse: if corresponding angles are congruent, the lines are parallel.',
      'If they differ, the lines meet: the second line is tilted by the difference d.',
    ],
    variables: [
      deg('a', 'm∠1', 'm∠1', 1, 179),
      deg('b', 'm∠5', 'm∠5', 1, 179),
      num('d', 'd', 'Difference', -178, 178, { unit: '°' }),
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
    example: { a: 81, b: 79, d: -2 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'markedFigure',
      transversal: { angle: 'a', second: 'b', highlight: [1, 5], labels: { 1: 'a', 5: 'b' } },
    },
  }),
  page({
    id: 'm.10.parallel-lines~algebra',
    title: 'Angle expressions',
    use: 'Use this for “ℓ ∥ m, corresponding angles are (4x + 12)° and (2x + 50)°. Find x and the angle.”',
    assumptions: [
      'The lines are parallel, so the two corresponding angles are congruent: set the expressions equal.',
      'Solve for x, then put it back to find the angle.',
      'An angle here must be between 0° and 180°.',
    ],
    variables: [
      coefficient('p', 'x coefficient of the first angle'),
      constant('q', 'Number in the first angle', 100),
      coefficient('r', 'x coefficient of the second angle'),
      constant('s', 'Number in the second angle', 100),
      der(num('x', 'x', 'x', -1000, 1000)),
      der(deg('t', 't', 'The angle', -1e5, 1e5)),
    ],
    rules: [
      bothSides('x'),
      derive(
        't = px + q',
        '{t} = {p} × {x} + {q}',
        't',
        (v) => v.p! * v.x! + v.q!,
        '{p} × {x} + {q}',
        'Put x back into the first angle.',
      ),
      limit(
        '0° < t < 180°',
        '{t} is between 0 and 180',
        (v) => v.t! > 0 && v.t! < 180,
        'An angle here must be between 0° and 180°: this x gives none.',
      ),
    ],
    example: { p: 4, q: 12, r: 2, s: 50, x: 19, t: 88 },
    startWith: ['p', 'q', 'r', 's'],
    equation: '({p}x + {q})° = ({r}x + {s})°',
    representation: {
      kind: 'markedFigure',
      transversal: { angle: 't', highlight: [1, 5], labels: { 1: 't', 5: 't' } },
    },
  }),
  page({
    id: 'm.10.parallel-lines~parallel-line',
    title: 'A parallel line through a point',
    use: 'Use this for “Write the equation of the line parallel to y = 3x − 4 through (2, 7).”',
    assumptions: [
      'Parallel lines have the same slope and different intercepts.',
      'Put the point into y = mx + b to find the new intercept: b = y₀ − m × x₀.',
    ],
    standalone: {
      vars: ['b1'],
      why: 'The given line’s intercept only draws it: the new line needs its slope alone.',
    },
    variables: [
      num('m', 'm', 'Slope', -20, 20),
      num('b1', 'b₁', 'Given line’s intercept', -20, 20),
      num('x0', 'x₀', 'Point, x', -20, 20),
      num('y0', 'y₀', 'Point, y', -20, 20),
      der(num('b2', 'b', 'New line’s intercept', -1000, 1000)),
    ],
    rules: [
      derive(
        'b = y₀ − m x₀',
        '{b2} = {y0} − {m} × {x0}',
        'b2',
        (v) => v.y0! - v.m! * v.x0!,
        '{y0} − {m} × {x0}',
        'The point is on the new line, so y₀ = m × x₀ + b.',
      ),
    ],
    example: { m: 3, b1: -4, x0: 2, y0: 7, b2: 1 },
    startWith: ['m', 'b1', 'x0', 'y0'],
    equation: 'y = {m}x + {b2}',
    representation: {
      kind: 'lineSystem',
      lines: [
        { slope: 'm', intercept: 'b1', label: 'Given' },
        { slope: 'm', intercept: 'b2', label: 'Parallel' },
      ],
      extent: 20,
      quadrants: 4,
      fixed: true,
    },
  }),
  page({
    id: 'm.10.parallel-lines~perpendicular-line',
    title: 'A perpendicular line through a point',
    use: 'Use this for “Write the equation of the line perpendicular to y = 2x + 1 through (4, 3).”',
    assumptions: [
      'Perpendicular slopes multiply to −1, so the new slope is −1 ÷ m.',
      'Put the point into y = mx + b to find the new intercept.',
      'A level line’s perpendicular is vertical, x = x₀: it has no slope.',
    ],
    standalone: {
      vars: ['b1'],
      why: 'The given line’s intercept only draws it: the new line needs its slope alone.',
    },
    variables: [
      num('m1', 'm₁', 'Given slope', -20, 20),
      num('b1', 'b₁', 'Given line’s intercept', -20, 20),
      num('x0', 'x₀', 'Point, x', -20, 20),
      num('y0', 'y₀', 'Point, y', -20, 20),
      der(num('m2', 'm₂', 'Perpendicular slope', -1e6, 1e6, { fraction: 100 })),
      der(num('b2', 'b', 'New line’s intercept', -1e6, 1e6, { fraction: 100 })),
    ],
    rules: [
      limit(
        'm₁ ≠ 0',
        '{m1} is not 0',
        (v) => v.m1! !== 0,
        'A level line’s perpendicular is vertical: x = x₀.',
      ),
      derive(
        'm₂ = −1/m₁',
        '{m2} = −1 ÷ {m1}',
        'm2',
        (v) => quot(-1, v.m1!),
        '−1 ÷ {m1}',
        'Perpendicular slopes multiply to −1.',
      ),
      derive(
        'b = y₀ − m₂ x₀',
        '{b2} = {y0} − {m2} × {x0}',
        'b2',
        (v) => v.y0! - v.m2! * v.x0!,
        '{y0} − {m2} × {x0}',
        'The point is on the new line, so y₀ = m₂ × x₀ + b.',
      ),
    ],
    example: { m1: 2, b1: 1, x0: 4, y0: 3, m2: -0.5, b2: 5 },
    startWith: ['m1', 'b1', 'x0', 'y0'],
    equation: 'y = {m2}x + {b2}',
    representation: {
      kind: 'lineSystem',
      lines: [
        { slope: 'm1', intercept: 'b1', label: 'Given' },
        { slope: 'm2', intercept: 'b2', label: 'Perpendicular' },
      ],
      extent: 20,
      quadrants: 4,
      fixed: true,
    },
  }),
];

// ─── m.10.rigid-motions ──────────────────────────────────────────────────────

/** A whole-number coordinate from −lim to lim. */
const grid = (id: string, symbol: string, name: string, lim = 7) =>
  num(id, symbol, name, -lim, lim, { step: 1, integer: true });
/** to = from, or to = −from (`sign` −1): a coordinate carried over, both ways. */
const carry = (to: string, from: string, how: string, sign = 1) =>
  rule(
    sign === 1 ? `${to} = ${from}` : `${to} = −${from}`,
    sign === 1 ? `{${to}} = {${from}}` : `{${to}} = −{${from}}`,
    {
      [to]: [(v) => sign * v[from]!, sign === 1 ? `{${from}}` : `−{${from}}`, how],
      [from]: [(v) => sign * v[to]!, sign === 1 ? `{${to}}` : `−{${to}}`, how],
    },
    (v) => v[to]! - sign * v[from]!,
  );
/** A value picked by a rule with no arithmetic (a count of lines): its check line is itself. */
const pick = (
  id: string,
  display: string,
  x: string,
  f: (v: Values) => number,
  how: (v: Values) => string,
): Rule => {
  const vars = [...new Set([...display.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))];
  return {
    relation: {
      id,
      display,
      vars,
      check: (v: Values) => `${f(v)} = ${v[x]}`,
      residual: (v: Values) => v[x]! - f(v),
      solve: Object.fromEntries(vars.map((k) => [k, k === x ? f : () => undefined])),
    },
    steps: { [x]: { expr: (v: Values) => `${f(v)}`, how } },
  };
};

const RIGID_MOTIONS: ModuleDef[] = [
  page({
    id: 'm.10.rigid-motions',
    assumptions: [
      'First reflect across the y-axis: (x, y) → (−x, y). Then rotate 90° counterclockwise about the origin: (x, y) → (−y, x).',
      'Each move keeps lengths and angles, so the final image is congruent to the figure.',
      'Order matters: swapping the two moves can land somewhere else.',
    ],
    standalone: {
      vars: ['ay', 'py', 'qx'],
      why: 'The reflection keeps y, and the turn sends that y to the new x on its own.',
    },
    variables: [
      grid('ax', 'x', 'x of A'),
      grid('ay', 'y', 'y of A'),
      grid('px', 'x′', 'x of A′'),
      grid('py', 'y′', 'y of A′'),
      grid('qx', 'x″', 'x of A″'),
      grid('qy', 'y″', 'y of A″'),
    ],
    rules: [
      carry('px', 'ax', 'Reflecting across the y-axis changes the sign of x.', -1),
      carry('py', 'ay', 'Reflecting across the y-axis keeps y.'),
      carry(
        'qx',
        'py',
        'A quarter turn counterclockwise: the new x is the old y with its sign changed.',
        -1,
      ),
      carry('qy', 'px', 'A quarter turn counterclockwise: the new y is the old x.'),
    ],
    example: { ax: 2, ay: 5, px: -2, py: 5, qx: -5, qy: -2 },
    startWith: ['ax', 'ay'],
    representation: {
      kind: 'transformation',
      figure: [
        ['ax', 'ay'],
        [5, 4],
        [5, 6],
      ],
      move: 'reflect',
      mirror: 'y-axis',
      image: { x: 'px', y: 'py' },
      then: { move: 'rotate', angle: 90 },
      image2: { x: 'qx', y: 'qy' },
      extent: 7,
    },
  }),
  page({
    id: 'm.10.rigid-motions~glide',
    title: 'A glide reflection',
    use: 'Use this for “Translate A(1, 2) 6 units right, then reflect it across the x-axis.”',
    assumptions: [
      'First slide h units right: (x, y) → (x + h, y). Then reflect across the x-axis: (x, y) → (x, −y).',
      'A slide along a line followed by a flip in that line is a glide reflection.',
    ],
    standalone: {
      vars: ['ay', 'py', 'qy'],
      why: 'The slide is across, so the heights change only by the flip.',
    },
    variables: [
      grid('ax', 'x', 'x of A'),
      grid('ay', 'y', 'y of A'),
      grid('h', 'h', 'Slide right'),
      grid('px', 'x′', 'x of A′', 14),
      grid('py', 'y′', 'y of A′'),
      grid('qx', 'x″', 'x of A″', 14),
      grid('qy', 'y″', 'y of A″'),
    ],
    rules: [
      sum('px', 'ax', 'h', 'The slide moves every point h units across.'),
      carry('py', 'ay', 'A slide across keeps y.'),
      carry('qx', 'px', 'Reflecting across the x-axis keeps x.'),
      carry('qy', 'py', 'Reflecting across the x-axis changes the sign of y.', -1),
    ],
    example: { ax: 1, ay: 2, h: 6, px: 7, py: 2, qx: 7, qy: -2 },
    startWith: ['ax', 'ay', 'h'],
    representation: {
      kind: 'transformation',
      figure: [
        ['ax', 'ay'],
        [-4, 2],
        [-6, 5],
      ],
      move: 'translate',
      right: 'h',
      up: 0,
      image: { x: 'px', y: 'py' },
      then: { move: 'reflect', mirror: 'x-axis' },
      image2: { x: 'qx', y: 'qy' },
      extent: 7,
    },
  }),
  page({
    id: 'm.10.rigid-motions~rotate-point',
    title: 'Rotating about a point',
    use: 'Use this for “Rotate A(6, 2) 90° counterclockwise about the point (1, 1).”',
    assumptions: [
      'The turn is 90° counterclockwise about the center (a, b).',
      'Measure A from the center, turn that step a quarter turn, and add it back to the center.',
      'So x′ = a − (y − b) and y′ = b + (x − a).',
    ],
    variables: [
      grid('ax', 'x', 'x of A', 8),
      grid('ay', 'y', 'y of A', 8),
      grid('a', 'a', 'x of the center', 8),
      grid('b', 'b', 'y of the center', 8),
      grid('px', 'x′', 'x of A′', 30),
      grid('py', 'y′', 'y of A′', 30),
    ],
    rules: [
      rule(
        'x′ = a − (y − b)',
        '{px} = {a} − ({ay} − {b})',
        {
          px: [
            (v) => v.a! - v.ay! + v.b!,
            '{a} − ({ay} − {b})',
            'A quarter turn sends the step up from the center to a step left.',
          ],
          ay: [
            (v) => v.a! + v.b! - v.px!,
            '{a} + {b} − {px}',
            'Undo the turn for the height of A.',
          ],
        },
        (v) => v.px! - (v.a! - v.ay! + v.b!),
      ),
      rule(
        'y′ = b + (x − a)',
        '{py} = {b} + ({ax} − {a})',
        {
          py: [
            (v) => v.b! + v.ax! - v.a!,
            '{b} + ({ax} − {a})',
            'A quarter turn sends the step right from the center to a step up.',
          ],
          ax: [(v) => v.py! - v.b! + v.a!, '{a} + ({py} − {b})', 'Undo the turn for the x of A.'],
        },
        (v) => v.py! - (v.b! + v.ax! - v.a!),
      ),
    ],
    example: { ax: 6, ay: 2, a: 1, b: 1, px: 0, py: 6 },
    startWith: ['ax', 'ay', 'a', 'b'],
    representation: {
      kind: 'transformation',
      figure: [
        ['ax', 'ay'],
        [7, 1],
        [7, 3],
      ],
      move: 'rotate',
      angle: 90,
      center: ['a', 'b'],
      image: { x: 'px', y: 'py' },
      extent: 8,
    },
  }),
  page({
    id: 'm.10.rigid-motions~reflect-line',
    title: 'Reflecting across y = −x',
    use: 'Use this for “Reflect A(4, 1) across the line y = −x.”',
    assumptions: [
      'Across y = −x the coordinates swap and both signs change: (x, y) → (−y, −x).',
      'Across y = x they only swap: (x, y) → (y, x).',
      'Each point and its image are the same distance from the line, on a segment at right angles to it.',
    ],
    standalone: { vars: ['ay', 'px'], why: 'The new x comes from the old y alone.' },
    variables: [
      grid('ax', 'x', 'x of A', 6),
      grid('ay', 'y', 'y of A', 6),
      grid('px', 'x′', 'x of A′', 6),
      grid('py', 'y′', 'y of A′', 6),
    ],
    rules: [
      carry('px', 'ay', 'Across y = −x, the new x is the old y with its sign changed.', -1),
      carry('py', 'ax', 'Across y = −x, the new y is the old x with its sign changed.', -1),
    ],
    example: { ax: 4, ay: 1, px: -1, py: -4 },
    startWith: ['ax', 'ay'],
    representation: {
      kind: 'transformation',
      figure: [
        ['ax', 'ay'],
        [4, 4],
        [2, 4],
      ],
      move: 'reflect',
      mirror: 'y = −x',
      image: { x: 'px', y: 'py' },
      extent: 6,
    },
  }),
  page({
    id: 'm.10.rigid-motions~symmetry',
    title: 'Symmetry of a rectangle',
    use: 'Use this for “Which rotations carry a 6 by 4 rectangle onto itself? How many lines of symmetry does it have?”',
    assumptions: [
      'The rectangle’s corners are (1, 1) and (r, u), with center (a, b) halfway across and up.',
      'A rectangle that isn’t a square has 2 lines of symmetry and is carried onto itself by 180° and 360° turns.',
      'A square (w = h) adds 90° and 270° turns and its two diagonals: 4 lines.',
    ],
    variables: [
      num('w', 'w', 'Width', 1, 8, { step: 1, integer: true }),
      num('h', 'h', 'Height', 1, 8, { step: 1, integer: true }),
      num('t', 't', 'Turn', 90, 360, { unit: '°', allowed: [90, 180, 270, 360] }),
      der(num('r', 'r', 'Right side at x =', 2, 9, { integer: true })),
      der(num('u', 'u', 'Top side at y =', 2, 9, { integer: true })),
      der(num('a', 'a', 'x of the center', 1.5, 5)),
      der(num('b', 'b', 'y of the center', 1.5, 5)),
      der(num('L', 'L', 'Lines of symmetry', 2, 4, { integer: true })),
      der(num('n', 'n', 'Order of rotational symmetry', 2, 4, { integer: true })),
      der(num('f', 'f', 'Carried onto itself (1 yes, 0 no)', 0, 1, { integer: true })),
    ],
    rules: [
      derive(
        'r = 1 + w',
        '{r} = 1 + {w}',
        'r',
        (v) => 1 + v.w!,
        '1 + {w}',
        'The right side is w squares from x = 1.',
      ),
      derive(
        'u = 1 + h',
        '{u} = 1 + {h}',
        'u',
        (v) => 1 + v.h!,
        '1 + {h}',
        'The top is h squares above y = 1.',
      ),
      derive(
        'a = (1 + r)/2',
        '{a} = (1 + {r}) ÷ 2',
        'a',
        (v) => (1 + v.r!) / 2,
        '(1 + {r}) ÷ 2',
        'The center is halfway across.',
      ),
      derive(
        'b = (1 + u)/2',
        '{b} = (1 + {u}) ÷ 2',
        'b',
        (v) => (1 + v.u!) / 2,
        '(1 + {u}) ÷ 2',
        'The center is halfway up.',
      ),
      pick(
        'L from w and h',
        '{L} lines when the sides are {w} and {h}',
        'L',
        (v) => (v.w === v.h ? 4 : 2),
        (v) =>
          v.w === v.h
            ? 'A square: the two midlines and the two diagonals.'
            : 'Not a square: only the two midlines; a diagonal flips it onto a different rectangle.',
      ),
      pick(
        'n from w and h',
        'order {n} when the sides are {w} and {h}',
        'n',
        (v) => (v.w === v.h ? 4 : 2),
        (v) =>
          v.w === v.h
            ? 'A square lands on itself every quarter turn.'
            : 'A rectangle lands on itself every half turn.',
      ),
      pick(
        'f from t and n',
        '{f}: does a turn of {t} carry it onto itself, order {n}',
        'f',
        (v) => (Math.round(v.t! * v.n!) % 360 === 0 ? 1 : 0),
        (v) =>
          Math.round(v.t! * v.n!) % 360 === 0
            ? 'The turn is a whole number of 360° ÷ n steps: the figure lands on itself.'
            : 'The turn is not a whole number of 360° ÷ n steps: the figure lands turned.',
      ),
    ],
    example: { w: 6, h: 4, t: 180, r: 7, u: 5, a: 4, b: 3, L: 2, n: 2, f: 1 },
    startWith: ['w', 'h', 't'],
    representation: {
      kind: 'transformation',
      figure: [
        [1, 1],
        ['r', 1],
        ['r', 'u'],
        [1, 'u'],
      ],
      move: 'rotate',
      angle: 't',
      center: ['a', 'b'],
      symmetry: true,
      extent: 10,
      quadrants: 1,
    },
  }),
];

// ─── m.10.congruence ─────────────────────────────────────────────────────────

const CONGRUENCE: ModuleDef[] = [
  page({
    id: 'm.10.congruence~corresponding-parts',
    title: 'Congruent parts with an unknown',
    use: 'Use this for “△ABC ≅ △DEF, AB = 3x + 2 and DE = x + 14. Find x and AB.”',
    assumptions: [
      'Corresponding parts of congruent triangles are congruent, so AB = DE: set the expressions equal.',
      'The order of the letters pairs the parts: A with D, B with E, C with F.',
      'Here BC = 16 and AC = 12, so AB must be between 4 and 28 for the triangle to close.',
    ],
    variables: [
      coefficient('p', 'x coefficient of AB'),
      constant('q', 'Number in AB', 100),
      coefficient('r', 'x coefficient of DE'),
      constant('s', 'Number in DE', 100),
      der(num('x', 'x', 'x', -1000, 1000)),
      der(num('L', 'AB', 'AB = DE', -1e5, 1e5)),
    ],
    rules: [
      bothSides('x'),
      derive(
        'AB = px + q',
        '{L} = {p} × {x} + {q}',
        'L',
        (v) => v.p! * v.x! + v.q!,
        '{p} × {x} + {q}',
        'Put x back into AB.',
      ),
      limit(
        '4 < AB < 28',
        '{L} is between 4 and 28',
        (v) => v.L! > 4 && v.L! < 28,
        'With BC = 16 and AC = 12, AB must be between 4 and 28, or the triangle doesn’t close.',
      ),
    ],
    example: { p: 3, q: 2, r: 1, s: 14, x: 6, L: 20 },
    startWith: ['p', 'q', 'r', 's'],
    equation: '{p}x + {q} = {r}x + {s}',
    representation: {
      kind: 'triangleSolver',
      parts: { c: 'L', a: 16, b: 12 },
      congruence: {},
    },
  }),
];

export const MATH_10_MODULES: ModuleDef[] = [
  ...CONSTRUCTIONS,
  ...PROOFS,
  ...PARALLEL_LINES,
  ...RIGID_MOTIONS,
  ...CONGRUENCE,
  ...SIMILARITY,
  ...SPECIAL,
  ...TRIG,
  ...COORDINATES,
  ...ARC_SECTOR,
  ...VOLUME,
  ...CIRCLE_THEOREMS,
  ...CIRCLE_EQUATIONS,
  ...LAW_SINES_COSINES,
  ...PROBABILITY_RULES,
  ...CONDITIONAL,
];
