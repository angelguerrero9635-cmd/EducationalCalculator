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
    // A figure-only relation places the drawing: it has no steps.
    steps: Object.fromEntries(
      rules.filter((r) => !r.relation.hidden).map((r) => [r.relation.id, r.steps]),
    ),
  };
}
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

/** The sign between two numbers as a relation box: 1 <, 3 >, 5 = (equal to 9 digits). */
const signOf = (x: number, y: number) =>
  Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y)) ? 5 : x < y ? 1 : 3;
const SIGN_TEXT: Record<number, string> = { 1: '<', 3: '>', 5: '=' };
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
/** The sentence's first letter in capitals. */
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);
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
    `${fn}({${A}}°) = {${x}} ÷ {${y}}`,
    {
      [x]: [
        (v) => v[y]! * f(v[A]!),
        `{${y}} × ${fn}({${A}}°)`,
        `${cap(top)} = ${bottom} × ${fn} ${A}.`,
      ],
      [y]: [
        (v) => quot(v[x]!, f(v[A]!)),
        `{${x}} ÷ ${fn}({${A}}°)`,
        `${cap(bottom)} = ${top} ÷ ${fn} ${A}.`,
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
            'The scale factor is a side of the image over its match in the original.',
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
/** x × y = z × w, solved for any one (`name`: the rule as the lesson writes it). */
const products = (x: string, y: string, z: string, w: string, how: string, name?: string) =>
  rule(
    name ?? `${x}${y} = ${z}${w}`,
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
      der(num('s', 's', 'Sine of A', 0, 1, { fraction: 100 })),
      der(num('k', 'k', 'Cosine of A', 0, 1, { fraction: 100 })),
      der(num('t', 't', 'Tangent of A', 0, 1e6, { fraction: 100 })),
    ],
    rules: [
      pythagoras('a', 'b', 'c', 'The legs and the hypotenuse of a right triangle: a² + b² = c².'),
      ratio('tan', 'A', 'a', 'b', ['opposite', 'adjacent']),
      ratio('sin', 'A', 'a', 'c', ['opposite', 'hypotenuse']),
      ratio('cos', 'A', 'b', 'c', ['adjacent', 'hypotenuse']),
      derive(
        's = a ÷ c (sin A)',
        '{s} = {a} ÷ {c}',
        's',
        (v) => quot(v.a!, v.c!),
        '{a} ÷ {c}',
        'The sine of A: the opposite side over the hypotenuse.',
      ),
      derive(
        'k = b ÷ c (cos A)',
        '{k} = {b} ÷ {c}',
        'k',
        (v) => quot(v.b!, v.c!),
        '{b} ÷ {c}',
        'The cosine of A: the adjacent side over the hypotenuse.',
      ),
      derive(
        't = a ÷ b (tan A)',
        '{t} = {a} ÷ {b}',
        't',
        (v) => quot(v.a!, v.b!),
        '{a} ÷ {b}',
        'The tangent of A: the opposite side over the adjacent side.',
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
    use: 'Use this for “A 7.5 m ladder leans at 38° to the ground. How high up the wall does it reach?”',
    assumptions: [
      'The wall is straight up from level ground, so the right angle is at its foot.',
      'The ladder is the hypotenuse; the height is opposite the angle A, the foot distance adjacent.',
      'Multiply the hypotenuse by sin A for the opposite side, by cos A for the adjacent side.',
    ],
    variables: [
      deg('A', 'A', 'Angle with the ground', 1, 89),
      len('o', 'o', 'Height up the wall', 10000, { unit: 'm' }),
      len('h', 'h', 'Ladder length', 10000, { unit: 'm' }),
      len('b', 'b', 'Foot from the wall', 10000, { unit: 'm' }),
    ],
    rules: [
      ratio('sin', 'A', 'o', 'h', ['opposite', 'hypotenuse']),
      ratio('cos', 'A', 'b', 'h', ['adjacent', 'hypotenuse']),
      pythagoras('o', 'b', 'h', 'The ladder is the hypotenuse of a right triangle.'),
    ],
    example: { A: 38, h: 7.5, o: 7.5 * sin(38), b: 7.5 * cos(38) },
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
    use: 'Use this for “A ramp rises 0.5 m over a run of 6 m. What angle does it make with the ground?”',
    assumptions: [
      'The rise is opposite the angle A and the run is adjacent to it, so tan A = rise ÷ run.',
      'The inverse tangent, tan⁻¹, turns the ratio back into the angle.',
      'Set the calculator to degrees.',
    ],
    variables: [
      deg('A', 'A', 'Ramp angle', 0.01, 89.99),
      len('o', 'o', 'Rise', 10000, { unit: 'm' }),
      len('r', 'r', 'Run', 10000, { unit: 'm' }),
    ],
    rules: [ratio('tan', 'A', 'o', 'r', ['opposite', 'adjacent'])],
    example: { o: 0.5, r: 6, A: atanD(0.5 / 6) },
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
    use: 'Use this for “From 36 m away, the angle of elevation to the top of a tree is 28°. How tall is the tree?”',
    assumptions: [
      'The angle of elevation is measured up from a level line through the eye.',
      'The height above the eye is opposite the angle: distance × tan A.',
      'Add the eye height for the whole height; use 0 when the angle is measured at the ground.',
    ],
    variables: [
      len('d', 'd', 'Distance along the ground', 10000, { unit: 'm', min: 0.1 }),
      deg('A', 'A', 'Angle of elevation', 0.01, 89.99),
      num('e', 'e', 'Eye height', 0, 3, { unit: 'm' }),
      len('u', 'u', 'Height above the eye', 1e6, { unit: 'm' }),
      len('H', 'H', 'Height of the top', 1e6, { unit: 'm' }),
    ],
    rules: [
      ratio('tan', 'A', 'u', 'd', ['opposite', 'adjacent']),
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
    example: { d: 36, A: 28, e: 1.5, u: 36 * tan(28), H: 36 * tan(28) + 1.5 },
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
      num('s', 's', 'Sine of A', 0.0001, 1),
      num('k', 'k', 'Cosine of B', 0.0001, 1),
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
        '{s} = sin({A}°)',
        {
          s: [
            (v) => sin(v.A!),
            'sin({A}°)',
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
        '{k} = cos({B}°)',
        {
          k: [
            (v) => cos(v.B!),
            'cos({B}°)',
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
      rule(
        'AD ÷ DB = AE ÷ EC',
        '{ad} ÷ {db} = {ae} ÷ {ec}',
        Object.fromEntries(
          (
            [
              ['ec', 'ae', 'db', 'ad'],
              ['ae', 'ad', 'ec', 'db'],
              ['db', 'ad', 'ec', 'ae'],
              ['ad', 'ae', 'db', 'ec'],
            ] as const
          ).map(([x, p, q, d]) => [
            x,
            [
              (v: Values) => quot(v[p]! * v[q]!, v[d]!),
              `{${p}} × {${q}} ÷ {${d}}`,
              'A line parallel to one side cuts the other two in the same ratio: cross-multiply.',
            ],
          ]),
        ),
        (v) => v.ad! * v.ec! - v.ae! * v.db!,
      ),
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
    id: 'm.10.similarity~splitter-converse',
    title: 'Is DE parallel to BC?',
    use: 'Use this for “D is on AB and E is on AC; AD = 4, DB = 6, AE = 6 and EC = 9. Is DE parallel to BC?”',
    assumptions: [
      'D is on side AB and E is on side AC.',
      'Converse of the side-splitter theorem: DE ∥ BC exactly when AD ÷ DB = AE ÷ EC.',
      'Unequal ratios mean DE tilts toward BC and would meet it.',
    ],
    variables: [
      len('ad', 'AD', 'AD'),
      len('db', 'DB', 'DB'),
      len('ae', 'AE', 'AE'),
      len('ec', 'EC', 'EC'),
      der(len('ab', 'AB', 'Side AB', 2000)),
      der(len('ac', 'AC', 'Side AC', 2000)),
      der(num('u', 'u', 'Ratio AD ÷ DB', 0, 1e5, { fraction: 100 })),
      der(num('w', 'w', 'Ratio AE ÷ EC', 0, 1e5, { fraction: 100 })),
      der(num('g', 'g', 'Sign (1 <, 3 >, 5 =)', 1, 5, { step: 1, integer: true })),
      // Where C and E sit: side AC drawn at 60° to AB.
      ...['cx', 'cy', 'ex', 'ey'].map((id) => ({
        ...num(id, id, id, -1e4, 1e4),
        derived: true,
        hidden: true,
      })),
    ],
    rules: [
      sum('ab', 'ad', 'db', 'Side AB is AD and DB put together.'),
      sum('ac', 'ae', 'ec', 'Side AC is AE and EC put together.'),
      derive(
        'u = AD ÷ DB',
        '{u} = {ad} ÷ {db}',
        'u',
        (v) => quot(v.ad!, v.db!),
        '{ad} ÷ {db}',
        'How many times DB fits in AD.',
      ),
      derive(
        'w = AE ÷ EC',
        '{w} = {ae} ÷ {ec}',
        'w',
        (v) => quot(v.ae!, v.ec!),
        '{ae} ÷ {ec}',
        'How many times EC fits in AE.',
      ),
      {
        relation: {
          id: 'g = sign between u and w',
          display: 'sign {g} between {u} and {w}',
          vars: ['g', 'u', 'w'],
          check: (v: Values) => `${signOf(v.u!, v.w!)} = ${v.g}`,
          residual: (v: Values) => v.g! - signOf(v.u!, v.w!),
          solve: { g: (v: Values) => signOf(v.u!, v.w!), u: () => undefined, w: () => undefined },
        },
        steps: {
          g: {
            expr: (v: Values) => `${signOf(v.u!, v.w!)}`,
            how: (v: Values) =>
              signOf(v.u!, v.w!) === 5
                ? 'The ratios are equal, so DE is parallel to BC: the converse of the side-splitter theorem.'
                : 'The ratios differ, so DE is not parallel to BC.',
            note: (v: Values) => `(${SIGN_TEXT[signOf(v.u!, v.w!)]})`,
          },
        },
      },
      ...(
        [
          ['cx', 'ac', 0.5],
          ['cy', 'ac', Math.sqrt(3) / 2],
          ['ex', 'ae', 0.5],
          ['ey', 'ae', Math.sqrt(3) / 2],
        ] as const
      ).map(([x, side, f]) =>
        rule(
          `${x} = ${f} ${side}`,
          `{${x}} = ${f} × {${side}}`,
          { [x]: [(v: Values) => f * v[side]!, '', ''] },
          (v) => v[x]! - f * v[side]!,
          {
            hidden: true,
          },
        ),
      ),
    ],
    example: {
      ad: 4,
      db: 6,
      ae: 6,
      ec: 9,
      ab: 10,
      ac: 15,
      u: 2 / 3,
      w: 2 / 3,
      g: 5,
      cx: 7.5,
      cy: 7.5 * Math.sqrt(3),
      ex: 3,
      ey: 3 * Math.sqrt(3),
    },
    startWith: ['ad', 'db', 'ae', 'ec'],
    equation: '{ad}/{db} {g:relation} {ae}/{ec}',
    representation: {
      kind: 'markedFigure',
      points: { A: [0, 0], B: ['ab', 0], C: ['cx', 'cy'], D: ['ad', 0], E: ['ex', 'ey'] },
      parts: [
        { segment: 'AB' },
        { segment: 'AC' },
        { segment: 'BC' },
        { segment: 'DE' },
        { label: 'AD', value: 'ad' },
        { label: 'DB', value: 'db' },
        { label: 'AE', value: 'ae' },
        { label: 'EC', value: 'ec' },
      ],
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
/** A probability worked out from counts, shown as the fraction it is (5/14). */
const chanceFrac = (id: string, symbol: string, name: string) =>
  der(num(id, symbol, name, 0, 1, { fraction: 10000 }));
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
    standalone: {
      vars: ['e', 'h'],
      why: 'On time by walking or car fill the table: neither the bus column nor the late row holds them.',
    },
    variables: [
      count('a', 'Late, bus'),
      count('b', 'Late, walk'),
      count('g', 'Late, car'),
      count('d', 'On time, bus'),
      count('e', 'On time, walk'),
      count('h', 'On time, car'),
      der(num('B', 'B', 'Bus total', 0, 2000)),
      der(num('L', 'L', 'Late total', 0, 3000)),
      chanceFrac('p', 'P(L | B)', 'P(Late | Bus)'),
      chanceFrac('q', 'P(B | L)', 'P(Bus | Late)'),
    ],
    rules: [
      total('B', ['a', 'd'], 'Add the bus column.'),
      share('p', 'a', 'B', 'Late among the bus riders only: the cell over its column total.'),
      total('L', ['a', 'b', 'g'], 'Add the late row.'),
      share('q', 'a', 'L', 'Bus riders among the late students: the cell over its row total.'),
    ],
    example: { a: 12, b: 4, g: 9, d: 48, e: 36, h: 51, B: 60, L: 25, p: 0.2, q: 0.48 },
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
    title: 'Independent events: three stages',
    use: 'Use this for “Three trains are on time with chances 0.9, 0.8 and 0.7. What is the chance all three are? That at least one is late?”',
    assumptions: [
      'Each train is on time or late, whatever the others do: the stages are independent.',
      'Along one path, multiply the chances: P(A and B and C) = P(A) × P(B) × P(C).',
      'At least one late is every other path: 1 − P(all on time).',
    ],
    variables: [
      chance('a', 'P(A)', 'First on time'),
      chance('b', 'P(B)', 'Second on time'),
      chance('c', 'P(C)', 'Third on time'),
      chanceOut('j', 'P(all)', 'All three on time'),
      chanceOut('m', 'P(some late)', 'At least one late'),
    ],
    rules: [
      derive(
        'P(all) = P(A) × P(B) × P(C)',
        '{j} = {a} × {b} × {c}',
        'j',
        (v) => v.a! * v.b! * v.c!,
        '{a} × {b} × {c}',
        'Independent stages: multiply along the path.',
      ),
      derive(
        'P(some late) = 1 − P(all)',
        '{m} = 1 − {j}',
        'm',
        (v) => 1 - v.j!,
        '1 − {j}',
        'Every path but the all-on-time one.',
      ),
    ],
    example: { a: 0.9, b: 0.8, c: 0.7, j: 0.504, m: 0.496 },
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'treeDiagram',
      chances: {
        first: ['a'],
        second: [['b'], ['b']],
        third: [
          [['c'], ['c']],
          [['c'], ['c']],
        ],
        names: [
          ['On time', 'Late'],
          ['On time', 'Late'],
        ],
        thirdNames: ['On time', 'Late'],
        stages: ['First', 'Second'],
        thirdStage: 'Third',
        path: [0, 0],
        path3: 0,
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
      chanceFrac('p1', 'P(R)', 'P(Red first)'),
      chanceFrac('p2', 'P(R | R)', 'P(Red second | Red first)'),
      chanceFrac('p3', 'P(R | B)', 'P(Red second | Blue first)'),
      chanceFrac('pp', 'P(R, R)', 'P(Red, then Red)'),
    ],
    rules: [
      limit(
        'r < n',
        '{rd} is less than {n}',
        (v) => v.rd! < v.n!,
        'Put at least one blue marble in the bag, or there is no blue first draw.',
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
        (v) => quot(v.rd!, v.n! - 1),
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
    use: 'Use this for “Of 60 students, 25 drink juice, 30 milk and 10 both. What fraction of the juice drinkers drink milk?”',
    assumptions: [
      'Given A, only the A circle counts: P(B | A) is the overlap out of everyone in A, both ÷ a.',
      'P(A | B) looks inside circle B instead: both ÷ b. The order of the events matters.',
      'A and B are independent only when P(B | A) = P(B) = b ÷ the total.',
    ],
    variables: [
      count('a', 'Drink juice (A)'),
      count('b', 'Drink milk (B)'),
      count('ab', 'Drink both'),
      count('N', 'Students in all'),
      chanceFrac('j', 'P(A ∩ B)', 'P(A and B)'),
      chanceFrac('c', 'P(B | A)', 'P(B | A)'),
      chanceFrac('d', 'P(A | B)', 'P(A | B)'),
    ],
    rules: [
      limit(
        'both ≤ A, B',
        '{ab} is at most {a} and {b}',
        (v) => v.ab! <= Math.min(v.a!, v.b!),
        'The overlap is part of both circles: it can’t be bigger than either.',
      ),
      limit(
        'A or B ≤ total',
        '{a} + {b} − {ab} is at most {N}',
        (v) => v.a! + v.b! - v.ab! <= v.N!,
        'The circles hold more people than there are in all.',
      ),
      share('j', 'ab', 'N', 'The overlap out of everyone.'),
      share('c', 'ab', 'a', 'Given A: only the people in A count, and ab of them are in B.'),
      share('d', 'ab', 'b', 'Given B: only the people in B count, and ab of them are in A.'),
    ],
    example: { a: 25, b: 30, ab: 10, N: 60, j: 1 / 6, c: 0.4, d: 1 / 3 },
    startWith: ['a', 'b', 'ab', 'N'],
    representation: {
      kind: 'venn',
      chances: {
        a: 'a',
        b: 'b',
        both: 'ab',
        names: ['Juice', 'Milk'],
        shade: 'and',
        result: 'j',
        counts: { total: 'N' },
      },
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
    `The distance formula${name}: the change across and the change up are the legs of a right triangle.`,
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
  der(num(id, `m${side}`, `Slope of ${side}`, -1000, 1000, { fraction: 1000 }));

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
      fit: true,
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
      'Given M and one end, the other end is as far past M: x₂ = 2xₘ − x₁.',
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
      num('mx', 'xₘ', 'x of M', -20, 20, { step: 0.25 }),
      num('my', 'yₘ', 'y of M', -20, 20, { step: 0.25 }),
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
      fit: true,
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
      der(num('px', 'xₚ', 'x of P', -20, 20)),
      der(num('py', 'yₚ', 'y of P', -20, 20)),
    ],
    rules: (['x', 'y'] as const).map((c) => {
      const r = derive(
        `${c}ₚ = ${c}₁ + m/(m + n) × (${c}₂ − ${c}₁)`,
        `{p${c}} = {${c}1} + {m} ÷ ({m} + {n}) × ({${c}2} − {${c}1})`,
        `p${c}`,
        (v) => v[`${c}1`]! + (v.m! / (v.m! + v.n!)) * (v[`${c}2`]! - v[`${c}1`]!),
        `{${c}1} + {m} ÷ ({m} + {n}) × ({${c}2} − {${c}1})`,
        `Start at A and go m of the m + n equal pieces of the change in ${c}.`,
      );
      // The fraction of the way, the change, then the share of it: −2 + 1/3 × 12, −2 + 4.
      r.steps[`p${c}`]!.work = (v: Values) => {
        const [a, b, m, n] = [v[`${c}1`]!, v[`${c}2`]!, v.m!, v.n!];
        const f = (x: number) => formatNumber(Number(x.toPrecision(12)));
        const par = (x: number) => (x < 0 ? `(${f(x)})` : f(x));
        const part = (m * (b - a)) / (m + n);
        return [
          `${c}ₚ = ${f(a)} + ${f(m)}/${f(m + n)} × ${par(b - a)}`,
          `${c}ₚ = ${f(a)} + ${par(part)}`,
        ];
      };
      return r;
    }),
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
      fit: true,
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
      fit: true,
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
      'Check the two slopes at each corner: a product of −1 is a right angle there.',
    ],
    variables: [
      ...['a', 'b', 'c'].flatMap(corner),
      slopeOut('mab', 'AB'),
      slopeOut('mbc', 'BC'),
      slopeOut('mac', 'AC'),
      der(num('p', 'p', 'Product at B, mAB × mBC', -1e6, 1e6, { fraction: 1000 })),
      der(num('q', 'q', 'Product at C, mBC × mAC', -1e6, 1e6, { fraction: 1000 })),
      der(num('w', 'w', 'Product at A, mAB × mAC', -1e6, 1e6, { fraction: 1000 })),
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
      derive(
        'q = mBC × mAC',
        '{q} = {mbc} × {mac}',
        'q',
        (v) => v.mbc! * v.mac!,
        '{mbc} × {mac}',
        'Multiply the two slopes at C: −1 means a right angle.',
      ),
      derive(
        'w = mAB × mAC',
        '{w} = {mab} × {mac}',
        'w',
        (v) => v.mab! * v.mac!,
        '{mab} × {mac}',
        'Multiply the two slopes at A: −1 means a right angle.',
      ),
    ],
    example: {
      ax: -1,
      ay: 1,
      bx: 1,
      by: 5,
      cx: 5,
      cy: 3,
      mab: 2,
      mbc: -0.5,
      mac: 1 / 3,
      p: -1,
      q: -1 / 6,
      w: 2 / 3,
    },
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
      fit: true,
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
      distance('ab', 'ax', 'ay', 'bx', 'by', ' for AB'),
      distance('bc', 'bx', 'by', 'cx', 'cy', ' for BC'),
      distance('ca', 'cx', 'cy', 'ax', 'ay', ' for CA'),
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
      fit: true,
      quadrants: 4,
    },
  }),
];

// ─── m.10.special-right-triangles ────────────────────────────────────────────

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
      der(num('s', 'S', 'Sum of the squares, a² + b²', 0, 2e6)),
      der(num('q', 'Q', 'Square of c', 0, 2e6)),
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
        'S = a² + b²',
        '{s} = {a}² + {b}²',
        's',
        (v) => v.a! ** 2 + v.b! ** 2,
        '{a}² + {b}²',
        'Square the two shorter sides and add.',
      ),
      derive('Q = c²', '{q} = {c}²', 'q', (v) => v.c! ** 2, '{c}²', 'Square the longest side.'),
      {
        relation: {
          id: 'r = sign between S and Q',
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
const arcLength = len('s', 's', 'Arc length', 1e4, { unit: 'cm', pi: true, min: 1e-6 });
const sectorArea = len('A', 'A', 'Sector area', 4e6, { unit: 'cm²', pi: true, min: 1e-6 });

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
      num('t', 'θ', 'Central angle (radians)', 0.01, 2 * Math.PI, { pi: 'fraction' }),
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
      'The volume is V = 4πr³ ÷ 3: two thirds of the cylinder that just holds the sphere.',
      'Given S or V, work back to the radius first.',
    ],
    variables: [
      cm('r', 'r', 'Radius'),
      cm2('S', 'S', 'Surface area'),
      { ...cm3('V', 'V', 'Volume'), pi: 'fraction' },
    ],
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
          V: [
            (v) => (4 * Math.PI * v.r! ** 3) / 3,
            '4 × π × {r}³ ÷ 3',
            'Cavalieri: a hemisphere matches a cylinder with a cone taken out, so V is 4πr³ ÷ 3.',
          ],
          r: [
            (v) => Math.cbrt((3 * v.V!) / (4 * Math.PI)),
            '∛(3 × {V} ÷ (4 × π))',
            'Multiply by 3, divide by 4π, then take the cube root.',
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
  page({
    id: 'm.10.volume-derivations~pyramid-surface',
    title: 'Surface area of a pyramid',
    use: 'Use this for “A square pyramid has base side 6 cm and height 4 cm. Find its slant height and surface area.”',
    assumptions: [
      'The base is a square with side b; the four side faces are equal triangles.',
      'The slant height ℓ is each triangle’s height: the hypotenuse of legs h and b ÷ 2.',
      'So S = b² + 4 × ½ × b × ℓ = b² + 2bℓ.',
    ],
    variables: [
      cm('b', 'b', 'Base side'),
      cm('h', 'h', 'Height'),
      cm('l', 'ℓ', 'Slant height', 1500),
      num('S', 'S', 'Surface area', 0, 1e8, { unit: 'cm²', units: ['mm²', 'cm²', 'm²'] }),
    ],
    rules: [
      rule(
        'ℓ² = h² + (b/2)²',
        '{l}² = {h}² + ({b} ÷ 2)²',
        {
          l: [
            (v) => Math.hypot(v.h!, v.b! / 2),
            '√({h}² + ({b} ÷ 2)²)',
            'The slant height is the hypotenuse over the middle of a base edge.',
          ],
          h: [
            (v) => root(v.l! ** 2 - (v.b! / 2) ** 2),
            '√({l}² − ({b} ÷ 2)²)',
            'The height is a leg of the right triangle under the slant height.',
          ],
        },
        (v) => v.l! ** 2 - v.h! ** 2 - (v.b! / 2) ** 2,
      ),
      rule(
        'S = b² + 2bℓ',
        '{S} = {b}² + 2 × {b} × {l}',
        {
          S: [
            (v) => v.b! ** 2 + 2 * v.b! * v.l!,
            '{b}² + 2 × {b} × {l}',
            'The square base and four triangles, each ½ × b × ℓ.',
          ],
          l: [
            (v) => quot(v.S! - v.b! ** 2, 2 * v.b!),
            '({S} − {b}²) ÷ (2 × {b})',
            'Take away the base; the four triangles are 2bℓ.',
          ],
        },
        (v) => v.S! - v.b! ** 2 - 2 * v.b! * v.l!,
      ),
    ],
    example: { b: 6, h: 4, l: 5, S: 96 },
    startWith: ['b', 'h'],
    unitSystems: ['metric'],
    representation: { kind: 'net', solid: 'squarePyramid', length: 'b', slant: 'l', total: 'S' },
  }),
];

// ─── m.10.modeling-density ───────────────────────────────────────────────────

/** A mass in grams (or kilograms). */
const grams = (id: string, symbol: string, name: string) =>
  num(id, symbol, name, 0.001, 1e9, { unit: 'g', units: ['g', 'kg'] });
/** A density in g/cm³ (or kg/m³). */
const density = (id: string, symbol: string, name: string) =>
  num(id, symbol, name, 0.0001, 100, { unit: 'g/cm³', units: ['g/cm³', 'kg/m³'] });
/** ρ = m ÷ V, solved for any one. */
const densityRule = rule(
  'ρ = m ÷ V',
  '{rho} = {m} ÷ {V}',
  {
    rho: [(v) => quot(v.m!, v.V!), '{m} ÷ {V}', 'Density is the mass in each cubic centimeter.'],
    m: [(v) => v.rho! * v.V!, '{rho} × {V}', 'Each cubic centimeter has ρ grams: multiply.'],
    V: [(v) => quot(v.m!, v.rho!), '{m} ÷ {rho}', 'How many cubic centimeters hold that mass.'],
  },
  (v) => v.rho! * v.V! - v.m!,
);
/** A rule with more step text (work lines, a note) for the value `x`. */
const withStep = (r: Rule, x: string, more: Partial<StepText>): Rule => ({
  ...r,
  steps: { ...r.steps, [x]: { ...r.steps[x]!, ...more } },
});
/** No material is denser than osmium, so a size that asks for more is refused with the reason. */
const densest = limit(
  'ρ ≤ 23 g/cm³',
  '{rho} is at most 23 g/cm³',
  (v) => v.rho! <= 23,
  'No material is denser than about 22.6 g/cm³ (osmium): check the mass or the sizes.',
);
const fmt4 = (x: number) => formatNumber(Number(x.toPrecision(12)));
/** The radius of the can of volume V with the least surface: h = 2r, so V = 2πr³. */
const bestRadius = (V: number) => Math.cbrt(V / (2 * Math.PI));

/**
 * Seven radii around the best one for a can of volume V (h = 2r at r = ∛(V ÷ 2π)), in steps
 * of 1, 2 or 5 times a power of ten, so the table's surface areas dip and rise again.
 */
function canRows(v: Values): number[] {
  const best = v.V !== undefined && v.V > 0 ? Math.cbrt(v.V / (2 * Math.PI)) : 4;
  const raw = best / 4;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [5, 2, 1].map((k) => k * p).find((s) => s <= raw * 1.01)!;
  const mid = Math.round(best / step);
  const first = Math.max(1, mid - 3);
  return Array.from({ length: 7 }, (_, i) => exact((first + i) * step)!);
}

const MODELING: ModuleDef[] = [
  page({
    id: 'm.10.modeling-density',
    assumptions: [
      'Density is mass per unit of volume: ρ = m ÷ V.',
      'Model the object as a solid you know: here a cylinder, V = πr²h.',
      'One material has one density at any size, so ρ names the material: aluminum is about 2.7 g/cm³.',
    ],
    variables: [
      cm('r', 'r', 'Radius'),
      cm('h', 'h', 'Height'),
      num('V', 'V', 'Volume', 0, 1e11, { unit: 'cm³', units: ['mm³', 'cm³', 'm³'] }),
      grams('m', 'm', 'Mass'),
      density('rho', 'ρ', 'Density'),
    ],
    rules: [cylinderVolume, densityRule, densest],
    example: { r: 2, h: 5, V: 20 * Math.PI, m: 170, rho: 170 / (20 * Math.PI) },
    startWith: ['r', 'h', 'm'],
    unitSystems: ['metric'],
    pictureLabels: ['m', 'rho'],
    representation: {
      kind: 'curvedSolid',
      shape: 'cylinder',
      radius: 'r',
      height: 'h',
      volume: 'V',
      extent: 6,
    },
  }),
  page({
    id: 'm.10.modeling-density~sphere',
    title: 'Mass of a ball from its density',
    use: 'Use this for “A steel ball has radius 1.5 cm and steel is 7.8 g/cm³. Find its mass.”',
    assumptions: [
      'Model the ball as a sphere: V = 4πr³ ÷ 3.',
      'Mass is density times volume: m = ρV.',
      'Given the mass and the material, work back to the volume first, then the radius.',
    ],
    variables: [
      cm('r', 'r', 'Radius'),
      num('V', 'V', 'Volume', 0, 1e11, { unit: 'cm³', units: ['mm³', 'cm³', 'm³'] }),
      density('rho', 'ρ', 'Density'),
      // The mass any radius and density on the page can give (V's range times ρ's).
      num('m', 'm', 'Mass', 1e-6, 1e11, { unit: 'g', units: ['g', 'kg'] }),
    ],
    rules: [
      rule(
        'V = 4πr³/3',
        '{V} = 4 × π × {r}³ ÷ 3',
        {
          V: [
            (v) => (4 * Math.PI * v.r! ** 3) / 3,
            '4 × π × {r}³ ÷ 3',
            'The volume of a sphere is 4πr³ ÷ 3.',
          ],
          r: [
            (v) => Math.cbrt((3 * v.V!) / (4 * Math.PI)),
            '∛(3 × {V} ÷ (4 × π))',
            'Multiply by 3, divide by 4π, then take the cube root.',
          ],
        },
        (v) => v.V! - (4 * Math.PI * v.r! ** 3) / 3,
      ),
      densityRule,
      densest,
    ],
    example: { r: 1.5, V: 4.5 * Math.PI, rho: 7.8, m: 7.8 * 4.5 * Math.PI },
    startWith: ['r', 'rho'],
    unitSystems: ['metric'],
    pictureLabels: ['rho', 'm'],
    representation: { kind: 'curvedSolid', shape: 'sphere', radius: 'r', volume: 'V', extent: 4 },
  }),
  page({
    id: 'm.10.modeling-density~cone',
    title: 'Mass of a cone from its density',
    use: 'Use this for “A solid aluminum cone (2.7 g/cm³) has radius 3 cm and height 4 cm. Find its mass.”',
    assumptions: [
      'Model the object as a cone: V = πr²h ÷ 3, a third of the cylinder on the same base.',
      'Mass is density times volume: m = ρV.',
      'Given the mass, work back to the volume first, then the height or the radius.',
    ],
    variables: [
      cm('r', 'r', 'Radius'),
      cm('h', 'h', 'Height'),
      num('V', 'V', 'Volume', 0, 1e11, { unit: 'cm³', units: ['mm³', 'cm³', 'm³'] }),
      density('rho', 'ρ', 'Density'),
      grams('m', 'm', 'Mass'),
    ],
    rules: [
      rule(
        'V = πr²h ÷ 3',
        '{V} = π × {r}² × {h} ÷ 3',
        {
          V: [
            (v) => (Math.PI * v.r! ** 2 * v.h!) / 3,
            'π × {r}² × {h} ÷ 3',
            'A cone holds a third of the cylinder with the same base and height.',
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
      densityRule,
      densest,
    ],
    example: { r: 3, h: 4, V: 12 * Math.PI, rho: 2.7, m: 2.7 * 12 * Math.PI },
    startWith: ['r', 'h', 'rho'],
    unitSystems: ['metric'],
    pictureLabels: ['rho', 'm'],
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
    id: 'm.10.modeling-density~population',
    title: 'Population density',
    use: 'Use this for “45,000 people live within 3 km of a town’s center. How many people per km²?”',
    assumptions: [
      'Population density is people per unit of area: D = N ÷ A.',
      'Model the region as a shape you know: here a circle around the center, A = πr².',
      'D is an average over the whole region; some parts are more crowded than others.',
    ],
    variables: [
      len('r', 'r', 'Radius of the region', 3000, { unit: 'km' }),
      num('A', 'A', 'Area', 0, 1e9, { unit: 'km²' }),
      num('N', 'N', 'Population', 1, 9e9, { unit: 'people' }),
      num('D', 'D', 'Population density', 1e-12, 1e10, { unit: 'people per km²' }),
    ],
    rules: [
      rule(
        'A = πr²',
        '{A} = π × {r}²',
        {
          A: [(v) => Math.PI * v.r! ** 2, 'π × {r}²', 'The area of a circle is πr².'],
          r: [(v) => root(v.A! / Math.PI), '√({A} ÷ π)', 'Divide by π, then take the square root.'],
        },
        (v) => v.A! - Math.PI * v.r! ** 2,
      ),
      rule(
        'D = N ÷ A',
        '{D} = {N} ÷ {A}',
        {
          D: [
            (v) => quot(v.N!, v.A!),
            '{N} ÷ {A}',
            'Share the people out over each square kilometer.',
          ],
          N: [(v) => v.D! * v.A!, '{D} × {A}', 'Each square kilometer holds D people: multiply.'],
          A: [
            (v) => quot(v.N!, v.D!),
            '{N} ÷ {D}',
            'How many square kilometers hold that many people.',
          ],
        },
        (v) => v.D! * v.A! - v.N!,
      ),
      limit(
        'D ≤ 2,000,000',
        '{D} is at most 2,000,000 people per km²',
        (v) => v.D! <= 2e6,
        'No place is more crowded than about 2 million people per km²: check the people or the radius.',
      ),
    ],
    example: { r: 3, A: 9 * Math.PI, N: 45000, D: 5000 / Math.PI },
    startWith: ['r', 'N'],
    unitSystems: ['metric'],
    pictureLabels: ['N', 'D'],
    representation: { kind: 'circle', radius: 'r', area: 'A', extent: 4 },
  }),
  page({
    id: 'm.10.modeling-density~can-design',
    title: 'Designing a can with the least material',
    use: 'Use this for “A can must hold 500 cm³. Which radius uses the least metal?”',
    assumptions: [
      'The can is a closed cylinder: V = πr²h, and its metal is the surface S = 2πr² + 2πrh.',
      'Hold V and try radii: the table shows S dip and then rise again.',
      'The least metal comes when the height equals the diameter, h = 2r, so V = 2πr³.',
    ],
    variables: [
      num('V', 'V', 'Volume', 1, 100000, { unit: 'cm³', units: ['cm³'] }),
      len('r', 'r', 'Radius', 1000, { unit: 'cm', units: ['cm'] }),
      len('h', 'h', 'Height', 10000, { unit: 'cm', units: ['cm'] }),
      num('S', 'S', 'Surface area', 0, 1e9, { unit: 'cm²', units: ['cm²'] }),
      der(
        num('rb', 'r_best', 'Radius with the least metal', 0, 1000, { unit: 'cm', units: ['cm'] }),
      ),
      der(num('Smin', 'S_min', 'Least surface area', 0, 1e9, { unit: 'cm²', units: ['cm²'] })),
    ],
    rules: [
      cylinderVolume,
      derive(
        'r_best = ∛(V ÷ 2π)',
        '{rb} = ∛({V} ÷ (2 × π))',
        'rb',
        (v) => bestRadius(v.V!),
        '∛({V} ÷ (2 × π))',
        'At the best can h = 2r, so V = πr² × 2r = 2πr³: divide by 2π and take the cube root.',
      ),
      derive(
        'S_min = 2πr_best² + 2V ÷ r_best',
        '{Smin} = 2 × π × {rb}² + 2 × {V} ÷ {rb}',
        'Smin',
        (v) => 2 * Math.PI * v.rb! ** 2 + (quot(2 * v.V!, v.rb!) ?? NaN),
        '2 × π × {rb}² + 2 × {V} ÷ {rb}',
        'The side 2πrh is 2V ÷ r, because h = V ÷ πr²: put in the best radius.',
      ),
      withStep(
        rule(
          'S = 2πr² + 2πrh',
          '{S} = 2 × π × {r}² + 2 × π × {r} × {h}',
          {
            S: [
              (v) => 2 * Math.PI * v.r! ** 2 + 2 * Math.PI * v.r! * v.h!,
              '2 × π × {r}² + 2 × π × {r} × {h}',
              'Two circles for the top and bottom, and the side unrolled: a rectangle 2πr by h.',
            ],
            h: [
              (v) => quot(v.S! - 2 * Math.PI * v.r! ** 2, 2 * Math.PI * v.r!),
              '({S} − 2 × π × {r}²) ÷ (2 × π × {r})',
              'Take away the two circles; the side is 2πr × h.',
            ],
          },
          (v) => v.S! - 2 * Math.PI * v.r! ** 2 - 2 * Math.PI * v.r! * v.h!,
        ),
        'S',
        {
          // With V known, the side is 2V ÷ r exactly: the numbers go into that line, so no
          // rounded h is ever multiplied. (V is not in this rule, so its value is written in.)
          expr: (v) =>
            v.V === undefined
              ? '2 × π × {r}² + 2 × π × {r} × {h}'
              : `2 × π × {r}² + 2 × ${fmt4(v.V)} ÷ {r}`,
          how: (v) =>
            v.V === undefined
              ? 'Two circles for the top and bottom, and the side unrolled: a rectangle 2πr by h.'
              : 'Two circles for the top and bottom, and the side. The side 2πrh is 2V ÷ r, since h = V ÷ πr².',
          work: (v) =>
            v.V === undefined ? [] : [`S = ${fmt4(2 * v.r! ** 2)}π + ${fmt4((2 * v.V) / v.r!)}`],
        },
      ),
    ],
    example: {
      V: 500,
      r: 4,
      h: 500 / (16 * Math.PI),
      S: 32 * Math.PI + 250,
      rb: bestRadius(500),
      Smin: 2 * Math.PI * bestRadius(500) ** 2 + 1000 / bestRadius(500),
    },
    startWith: ['V', 'r'],
    unitSystems: ['metric'],
    representation: { kind: 'table', sweep: 'r', output: 'S', params: ['V'], rows: canRows },
  }),
  page({
    id: 'm.10.modeling-density~fence',
    title: 'The most area for a fixed perimeter',
    use: 'Use this for “40 m of fence makes a rectangular pen. Which sides give the most area?”',
    assumptions: [
      'The fence is the perimeter: P = 2x + 2y, so x + y is half of P.',
      'The pen’s area is A = xy; a longer side means a shorter one.',
      'For a fixed perimeter the square, x = y = P ÷ 4, holds the most area.',
    ],
    variables: [
      len('P', 'P', 'Perimeter', 1e5, { unit: 'm' }),
      len('x', 'x', 'Length', 1e5, { unit: 'm' }),
      len('y', 'y', 'Width', 1e5, { unit: 'm' }),
      num('A', 'A', 'Area', 0, 1e9, { unit: 'm²' }),
      // From 0.0025 m (a quarter of the least fence), so the limit x < P ÷ 2 gives the reason.
      der(num('s', 's', 'Side of the best pen', 0.0025, 1e5, { unit: 'm' })),
      der(num('Am', 'A_max', 'Most area', 0, 1e9, { unit: 'm²' })),
    ],
    rules: [
      derive(
        's = P ÷ 4',
        '{s} = {P} ÷ 4',
        's',
        (v) => v.P! / 4,
        '{P} ÷ 4',
        'The best pen is a square: the fence makes four equal sides.',
      ),
      derive(
        'A_max = s²',
        '{Am} = {s}²',
        'Am',
        (v) => v.s! ** 2,
        '{s}²',
        'The square’s area is its side times itself; any other sides give less.',
      ),
      rule(
        'P = 2x + 2y',
        '{P} = 2 × {x} + 2 × {y}',
        {
          P: [
            (v) => 2 * v.x! + 2 * v.y!,
            '2 × {x} + 2 × {y}',
            'The fence goes once around: two lengths and two widths.',
          ],
          y: [
            (v) => v.P! / 2 - v.x!,
            '{P} ÷ 2 − {x}',
            'Half the fence is one length and one width.',
          ],
          x: [
            (v) => v.P! / 2 - v.y!,
            '{P} ÷ 2 − {y}',
            'Half the fence is one length and one width.',
          ],
        },
        (v) => v.P! - 2 * v.x! - 2 * v.y!,
      ),
      limit(
        'x < P/2',
        '{x} is less than {P} ÷ 2',
        (v) => v.x! < v.P! / 2,
        'The length must be less than half the fence, or no fence is left for the widths.',
      ),
      limit(
        'y < P/2',
        '{y} is less than {P} ÷ 2',
        (v) => v.y! < v.P! / 2,
        'The width must be less than half the fence, or no fence is left for the lengths.',
      ),
      rule(
        'A = xy',
        '{A} = {x} × {y}',
        {
          A: [(v) => v.x! * v.y!, '{x} × {y}', 'The area of a rectangle is length × width.'],
          y: [(v) => quot(v.A!, v.x!), '{A} ÷ {x}', 'Divide the area by the length.'],
          x: [(v) => quot(v.A!, v.y!), '{A} ÷ {y}', 'Divide the area by the width.'],
        },
        (v) => v.A! - v.x! * v.y!,
      ),
    ],
    example: { P: 40, x: 12, y: 8, A: 96, s: 10, Am: 100 },
    startWith: ['P', 'x'],
    unitSystems: ['metric'],
    representation: {
      kind: 'rectangle',
      length: 'x',
      width: 'y',
      around: 'P',
      inside: 'A',
      extent: 20,
    },
  }),
];

// ─── m.10.circle-theorems ────────────────────────────────────────────────────

/**
 * x = (p ± q) ÷ 2, the sign from the + − box o (1 +, 2 −). 3 − 2o is 1 for + and −1 for −: a
 * product, so the solver never reads the relation as a straight-line sum while o is still open.
 */
const arcSign = (v: Values) => 3 - 2 * v.o!;
const arcOp = (v: Values) => (v.o === 2 ? '−' : '+');
const arcAngleRule: Rule = {
  relation: {
    id: 'x = (p ± q)/2',
    display: '{x} = ({p} + (3 − 2 × {o}) × {q}) ÷ 2',
    vars: ['x', 'p', 'q', 'o'],
    residual: (v) => 2 * v.x! - (v.p! + arcSign(v) * v.q!),
    solve: {
      x: (v) => (v.p! + arcSign(v) * v.q!) / 2,
      p: (v) => 2 * v.x! - arcSign(v) * v.q!,
      q: (v) => arcSign(v) * (2 * v.x! - v.p!),
      // The + − box is typed, never worked out.
      o: () => undefined,
    },
  },
  steps: {
    x: {
      expr: (v: Values) => `({p} ${arcOp(v)} {q}) ÷ 2`,
      how: (v: Values) =>
        v.o === 2
          ? 'Outside the circle: half the far arc minus the near arc.'
          : 'Inside the circle: half the sum of the two arcs.',
    },
    p: {
      expr: (v: Values) => (v.o === 2 ? '2 × {x} + {q}' : '2 × {x} − {q}'),
      how: 'Double the angle, then undo the other arc.',
    },
    q: {
      expr: (v: Values) => (v.o === 2 ? '{p} − 2 × {x}' : '2 × {x} − {p}'),
      how: 'Double the angle, then undo the first arc.',
    },
  },
};

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
      len('a', 'AE', 'AE'),
      len('b', 'EB', 'EB'),
      len('c', 'CE', 'CE'),
      len('d', 'ED', 'ED', 1e6),
    ],
    rules: [
      products(
        'a',
        'b',
        'c',
        'd',
        'Crossing chords: the products of their parts are equal.',
        'AE × EB = CE × ED',
      ),
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
      len('a', 'PA', 'PA (outside)'),
      len('b', 'PB', 'PB (whole)', 1e6),
      len('c', 'PC', 'PC (outside)'),
      len('d', 'PD', 'PD (whole)', 1e6),
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
        'PA × PB = PC × PD',
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
      len('t', 'PT', 'PT (tangent)'),
      len('a', 'PA', 'PA (outside)'),
      len('b', 'PB', 'PB (whole)', 1e6),
    ],
    rules: [
      limit(
        'PB > PA',
        '{b} is more than {a}',
        (v) => v.b! > v.a!,
        'A whole secant is longer than its outside part.',
      ),
      rule(
        'PT² = PA × PB',
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
  page({
    id: 'm.10.circle-theorems~cyclic-quadrilateral',
    title: 'Opposite angles of an inscribed quadrilateral',
    use: 'Use this for “ABCD is inscribed in a circle and m∠A = 84°. Find m∠C.”',
    assumptions: [
      'ABCD is inscribed: all four corners are on the circle.',
      'Each angle is half the arc across from it; the arcs across from A and from C make the whole circle.',
      'So opposite angles add to 180°: m∠A + m∠C = 180° and m∠B + m∠D = 180°.',
    ],
    variables: [deg('a', 'm∠A', 'm∠A'), deg('c', 'm∠C', 'm∠C')],
    rules: [
      rule(
        'A + C = 180',
        '{a} + {c} = 180',
        {
          c: [
            (v) => 180 - v.a!,
            '180 − {a}',
            'Opposite angles of an inscribed quadrilateral add to 180°.',
          ],
          a: [
            (v) => 180 - v.c!,
            '180 − {c}',
            'Opposite angles of an inscribed quadrilateral add to 180°.',
          ],
        },
        (v) => v.a! + v.c! - 180,
      ),
    ],
    example: { a: 84, c: 96 },
    startWith: ['a'],
    representation: {
      kind: 'circleTheorems',
      theorem: 'cyclic',
      cyclic: { A: 'a', C: 'c' },
    },
  }),
  page({
    id: 'm.10.circle-theorems~chord-angle',
    title: 'Angles from arcs',
    use: 'Use this for “Two chords cross inside a circle, cutting off arcs of 70° and 110°. Find the angle.”',
    assumptions: [
      'Two chords crossing inside the circle (+): the angle is half the sum of its arc and its vertical angle’s arc.',
      'Two secants meeting outside (−): the angle is half the far arc minus the near arc.',
      'p is arc AC inside, or the far arc outside; q is the other arc.',
    ],
    variables: [
      deg('p', 'p', 'First arc (far arc outside)', 0.1, 359.9),
      deg('q', 'q', 'Second arc (near arc outside)', 0.1, 359.9),
      num('o', 'o', 'Inside (1, +) or outside (2, −)', 1, 2, {
        allowed: [1, 2],
        integer: true,
        step: 1,
      }),
      deg('x', 'x', 'The angle'),
    ],
    rules: [arcAngleRule],
    example: { p: 70, q: 110, o: 1, x: 90 },
    startWith: ['p', 'o', 'q'],
    equation: '{x}° = ({p}° {o:op} {q}°) ÷ 2',
    representation: {
      kind: 'circleTheorems',
      theorem: 'arcAngle',
      arcAngle: { arcs: ['p', 'q'], angle: 'x', where: 'o' },
    },
  }),
];

// ─── m.10.circle-equations ───────────────────────────────────────────────────

const rSquared = rule(
  'q = r²',
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
      num('q', 'q', 'Right side, r²', 0.01, 10000),
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
      der(num('x2', 'x₂', 'Other point, x', -240, 240)),
    ],
    rules: [
      (() => {
        const r = rule(
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
        );
        // The stages under the ±: the square, the root, then the two points.
        const pm = (c: string, center: number, other: number, otherCenter: number, r: number) => {
          const sq = (other - otherCenter) ** 2;
          const d = r ** 2 - sq;
          const f = (n: number) => formatNumber(Number(n.toPrecision(12)));
          return [
            `${c} = ${f(center)} ± √(${f(r ** 2)} − ${f(sq)})`,
            `${c} = ${f(center)} ± √${f(d)}`,
            `${c} = ${f(center)} ± ${f(Math.sqrt(d))}`,
          ];
        };
        r.steps.x!.work = (v: Values) => pm('x', v.h!, v.y!, v.k!, v.r!);
        r.steps.y!.work = (v: Values) => pm('y', v.k!, v.x!, v.h!, v.r!);
        return r;
      })(),
      derive(
        'x₂ = 2h − x',
        '{x2} = 2 × {h} − {x}',
        'x2',
        (v) => 2 * v.h! - v.x!,
        '2 × {h} − {x}',
        'The other point is the mirror image across x = h.',
      ),
    ],
    example: { h: 1, k: 2, r: 5, y: 5, x: 5, x2: -3 },
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
    `{${x}}² = {${y}}² + {${z}}² − 2 × {${y}} × {${z}} × cos({${X}}°)`,
    {
      [x]: [
        (v) => root(v[y]! ** 2 + v[z]! ** 2 - 2 * v[y]! * v[z]! * cos(v[X]!)),
        `√({${y}}² + {${z}}² − 2 × {${y}} × {${z}} × cos({${X}}°))`,
        `Law of cosines: the two sides beside ${X} and the angle between them give the side across from it.`,
      ],
      [X]: [
        (v) => acosD((v[y]! ** 2 + v[z]! ** 2 - v[x]! ** 2) / (2 * v[y]! * v[z]!)),
        `cos⁻¹(({${y}}² + {${z}}² − {${x}}²) ÷ (2 × {${y}} × {${z}}))`,
        `Law of cosines turned round: three sides give the angle ${X}.`,
      ],
      [y]: [
        (v) => beside(v[x]!, v[z]!, v[X]!),
        `{${z}} × cos({${X}}°) ± √({${x}}² − ({${z}} × sin({${X}}°))²)`,
        `Law of cosines as a quadratic in ${y}: two lengths fit when both come out positive.`,
      ],
      [z]: [
        (v) => beside(v[x]!, v[y]!, v[X]!),
        `{${y}} × cos({${X}}°) ± √({${x}}² − ({${y}} × sin({${X}}°))²)`,
        `Law of cosines as a quadratic in ${z}: two lengths fit when both come out positive.`,
      ],
    },
    (v) => v[x]! ** 2 - (v[y]! ** 2 + v[z]! ** 2 - 2 * v[y]! * v[z]! * cos(v[X]!)),
  );
/**
 * How many triangles fit side a across from the acute angle A, with side b next to A: none
 * when a is shorter than the height b sin A, one when a is the height or at least b, else two.
 */
function ssaCount(a: number, b: number, A: number) {
  const h = b * sin(A);
  const tol = 1e-9 * Math.max(1, h);
  if (a < h - tol) return 0;
  if (Math.abs(a - h) <= tol || a >= b) return 1;
  return 2;
}
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
    `{${x}} ÷ sin({${X}}°) = {${y}} ÷ sin({${Y}}°)`,
    {
      [x]: [
        (v) => quot(v[y]! * sin(v[X]!), sin(v[Y]!)),
        `{${y}} × sin({${X}}°) ÷ sin({${Y}}°)`,
        'Law of sines: multiply both sides by the sine of the angle across from the side.',
      ],
      [y]: [
        (v) => quot(v[x]! * sin(v[Y]!), sin(v[X]!)),
        `{${x}} × sin({${Y}}°) ÷ sin({${X}}°)`,
        'Law of sines: multiply both sides by the sine of the angle across from the side.',
      ],
      [X]: [
        (v) => fitAngle(asinBoth((v[x]! * sin(v[Y]!)) / v[y]!), v[Y]!),
        ...inverseSine(X, `{${x}} × sin({${Y}}°) ÷ {${y}}`),
      ],
      [Y]: [
        (v) => fitAngle(asinBoth((v[y]! * sin(v[X]!)) / v[x]!), v[X]!),
        ...inverseSine(Y, `{${y}} × sin({${X}}°) ÷ {${x}}`),
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
      sines('a', 'A', 'c', 'C'),
      sines('b', 'B', 'c', 'C'),
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
  page({
    id: 'm.10.law-sines-cosines~ambiguous-case',
    title: 'The ambiguous case (SSA)',
    use: 'Use this for “A = 30°, a = 6 and b = 10. How many triangles fit, and what is B?”',
    assumptions: [
      'Side a is across from the acute angle A, and b is the other side next to A.',
      'Acute A: a < b × sin A fits none, a = b × sin A or a ≥ b fits one, anything between fits two.',
      'Two triangles share the same sin B: B and 180° − B.',
    ],
    variables: [
      len('a', 'a', 'Side a (across from A)', 1000, { min: 0.1 }),
      len('b', 'b', 'Side b', 1000, { min: 0.1 }),
      deg('A', 'A', 'Angle A', 1, 89),
      der(len('h', 'h', 'Height b × sin A', 1000, { min: 0.001 })),
      der(num('n', 'n', 'Triangles that fit', 0, 2, { integer: true })),
      der(deg('B', 'B', 'Angle B', 0.001, 179.999)),
      der(deg('B2', 'B₂', 'Second B, 180° − B', 0.001, 179.999)),
      der(deg('C', 'C', 'Angle C', 0.001, 179.999)),
      der(deg('C2', 'C₂', 'Second C', 0.001, 179.999)),
      der(len('c', 'c', 'Side c', 2000, { min: 1e-6 })),
      der(len('c2', 'c₂', 'Second c', 2000, { min: 1e-6 })),
    ],
    rules: [
      derive(
        'h = b sin A',
        '{h} = {b} × sin({A}°)',
        'h',
        (v) => v.b! * sin(v.A!),
        '{b} × sin({A}°)',
        'The height from C to the line of side c: b is its hypotenuse.',
      ),
      (() => {
        const r = pick(
          'n from a, h and b',
          '{n} = the triangles side {a} makes with height {h} and side {b}',
          'n',
          (v) => ssaCount(v.a!, v.b!, v.A!),
          (v) =>
            [
              'a is shorter than the height h: it can’t reach the base line, so none fits.',
              v.a! < v.b!
                ? 'a equals the height h: it just reaches the base line, a right angle at B.'
                : 'a is at least b: the second place a could land is behind A, so one fits.',
              'a is between h and b: it reaches the base line in two places, so two fit.',
            ][ssaCount(v.a!, v.b!, v.A!)]!,
        );
        // The comparison behind the count: (5 < 6 < 10).
        r.steps.n!.note = (v: Values) => {
          const [a, h, b] = [v.a!, v.h!, v.b!].map((x) => formatNumber(x));
          return [
            `(a < h: ${a} < ${h})`,
            v.a! < v.b! ? `(a = h = ${a})` : `(a ≥ b: ${a} ≥ ${b})`,
            `(h < a < b: ${h} < ${a} < ${b})`,
          ][ssaCount(v.a!, v.b!, v.A!)]!;
        };
        return r;
      })(),
      derive(
        'sin B = b sin A ÷ a',
        '{B} = sin⁻¹({b} × sin({A}°) ÷ {a})',
        'B',
        (v) => (ssaCount(v.a!, v.b!, v.A!) ? asinD((v.b! * sin(v.A!)) / v.a!) : undefined),
        'sin⁻¹({b} × sin({A}°) ÷ {a})',
        'Law of sines, solved for sin B, then the inverse sine.',
      ),
      derive(
        'B₂ = 180° − B',
        '{B2} = 180 − {B}',
        'B2',
        (v) => (ssaCount(v.a!, v.b!, v.A!) === 2 ? 180 - v.B! : undefined),
        '180 − {B}',
        'The same sine fits the obtuse angle too.',
      ),
      derive(
        'C = 180° − A − B',
        '{C} = 180 − {A} − {B}',
        'C',
        (v) => 180 - v.A! - v.B!,
        '180 − {A} − {B}',
        'The angles of a triangle add to 180°.',
      ),
      derive(
        'C₂ = 180° − A − B₂',
        '{C2} = 180 − {A} − {B2}',
        'C2',
        (v) => 180 - v.A! - v.B2!,
        '180 − {A} − {B2}',
        'The angles of the second triangle add to 180° too.',
      ),
      derive(
        'c = a sin C ÷ sin A',
        '{c} = {a} × sin({C}°) ÷ sin({A}°)',
        'c',
        (v) => quot(v.a! * sin(v.C!), sin(v.A!)),
        '{a} × sin({C}°) ÷ sin({A}°)',
        'Law of sines: c ÷ sin C = a ÷ sin A.',
      ),
      derive(
        'c₂ = a sin C₂ ÷ sin A',
        '{c2} = {a} × sin({C2}°) ÷ sin({A}°)',
        'c2',
        (v) => quot(v.a! * sin(v.C2!), sin(v.A!)),
        '{a} × sin({C2}°) ÷ sin({A}°)',
        'Law of sines again, with the second triangle’s angle C₂.',
      ),
    ],
    example: (() => {
      const B = asinD((10 * sin(30)) / 6)!;
      const [C, C2] = [150 - B, B - 30];
      return {
        a: 6,
        b: 10,
        A: 30,
        h: 5,
        n: 2,
        B,
        B2: 180 - B,
        C,
        C2,
        c: (6 * sin(C)) / sin(30),
        c2: (6 * sin(C2)) / sin(30),
      };
    })(),
    startWith: ['a', 'b', 'A'],
    representation: {
      kind: 'triangleSolver',
      parts: { a: 'a', b: 'b', c: 'c', A: 'A', B: 'B', C: 'C' },
      given: ['a', 'b', 'A'],
    },
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
        '{K} = {a} × {b} × sin({C}°) ÷ 2',
        {
          K: [
            (v) => (v.a! * v.b! * sin(v.C!)) / 2,
            '{a} × {b} × sin({C}°) ÷ 2',
            'Half the base times the height, and the height is b × sin C.',
          ],
          a: [
            (v) => quot(2 * v.K!, v.b! * sin(v.C!)),
            '2 × {K} ÷ ({b} × sin({C}°))',
            'Undo the half, then divide by b × sin C.',
          ],
          b: [
            (v) => quot(2 * v.K!, v.a! * sin(v.C!)),
            '2 × {K} ÷ ({a} × sin({C}°))',
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

/** n × (n − 1) × … for r factors: the ordered count P(n, r), exact for whole numbers. */
const falling = (n: number, r: number) => {
  let out = 1;
  for (let i = 0; i < r; i++) out *= n - i;
  return out;
};
/** The factors of n × (n − 1) × … for r places, as written ("8 × 7 × 6"). */
const factors = (n: number, r: number) =>
  Array.from({ length: r }, (_, i) => formatNumber(n - i)).join(' × ');
/** The most ways a counting page shows (a count past it has more digits than a line holds). */
const MOST_WAYS = 1e12;
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
  const count = rule(
    perm ? 'P = n! ÷ (n − r)!' : 'C = n! ÷ ((n − r)! × r!)',
    perm ? '{c} = {n}! ÷ ({n} − {r})!' : '{c} = {n}! ÷ (({n} − {r})! × {r}!)',
    {
      c: [
        (v) => (perm ? falling(v.n!, v.r!) : choose(v.n!, v.r!)),
        perm ? '{n}! ÷ ({n} − {r})!' : '{n}! ÷ (({n} − {r})! × {r}!)',
        perm
          ? 'n × (n − 1) × … for r places: n! with the unused (n − r)! divided out.'
          : 'The ordered count, n! ÷ (n − r)!, divided by the r! orders of each group.',
      ],
    },
    (v) => v.c! - (perm ? falling(v.n!, v.r!) : choose(v.n!, v.r!)),
  );
  // The factors a student writes: 8 × 7 × 6, then over 3 × 2 × 1 for a combination.
  count.steps.c!.work = (v: Values) =>
    v.r! < 2
      ? []
      : perm
        ? [`P = ${factors(v.n!, v.r!)}`]
        : [
            `C = (${factors(v.n!, v.r!)}) ÷ (${factors(v.r!, v.r!)})`,
            `C = ${formatNumber(falling(v.n!, v.r!))} ÷ ${formatNumber(falling(v.r!, v.r!))}`,
          ];
  count.steps.c!.written = false;
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
      num('n', 'n', 'Choices', 1, 60, { step: 1, integer: true }),
      num('r', 'r', perm ? 'Places filled in order' : 'Chosen', 0, 14, {
        step: 1,
        integer: true,
      }),
      der(num('c', kind, perm ? 'Ways' : 'Groups', 1, MOST_WAYS, { integer: true })),
    ],
    rules: [
      limit(
        'r ≤ n',
        '{r} is at most {n}',
        (v) => v.r! <= v.n!,
        'You can’t choose more than there are.',
      ),
      limit(
        `${kind} ≤ 10¹²`,
        `${kind}({n}, {r}) is at most a trillion`,
        (v) => (perm ? falling(v.n!, v.r!) : choose(v.n!, v.r!)) <= MOST_WAYS,
        'That many ways passes what the page can show: try fewer places.',
      ),
      count,
    ],
    example: { n: 8, r: 3, c: perm ? 336 : 56 },
    startWith: ['n', 'r'],
    sliders: true,
    equation: `${kind}({n}, {r}) = {c}`,
    representation: {
      kind: 'pascalTriangle',
      n: 'n',
      triangle: false,
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
  page({
    id: 'm.10.probability-rules~complement',
    title: 'The complement rule',
    use: 'Use this for “The chance of rain is 0.35. What is the chance of no rain?”',
    assumptions: [
      'Everything outside A is the complement of A, written A′ or “not A”.',
      'A and not A together fill the rectangle, whose probability is 1.',
      'So P(not A) = 1 − P(A).',
    ],
    variables: [chance('a', 'P(Rain)', 'P(Rain)'), chanceOut('s', 'P(not Rain)', 'P(not Rain)')],
    rules: [
      rule(
        'P(not A) = 1 − P(A)',
        '{s} = 1 − {a}',
        {
          s: [(v) => 1 - v.a!, '1 − {a}', 'Everything outside Rain: take P(Rain) from 1.'],
          a: [
            (v) => 1 - v.s!,
            '1 − {s}',
            'Rain and not Rain fill the rectangle: take P(not Rain) from 1.',
          ],
        },
        (v) => v.s! + v.a! - 1,
      ),
    ],
    example: { a: 0.35, s: 0.65 },
    startWith: ['a'],
    representation: {
      kind: 'venn',
      chances: {
        a: 'a',
        b: 0,
        both: 0,
        names: ['Rain', 'Wind'],
        shade: 'notA',
        result: 's',
        one: true,
      },
    },
  }),
  page({
    id: 'm.10.probability-rules~neither',
    title: 'Neither event',
    use: 'Use this for “Of 40 students, 22 play soccer, 15 basketball and 8 both. How many play neither, and what is the chance of neither?”',
    assumptions: [
      'Each circle counts the people in it; the overlap counts those in both.',
      'Soccer or basketball counts the overlap once: a + b − both.',
      'Neither is everyone else in the rectangle: the total minus that.',
    ],
    variables: [
      count('a', 'In Soccer'),
      count('b', 'In Basketball'),
      count('ab', 'In both'),
      count('N', 'In all'),
      der(count('u', 'In Soccer or Basketball', 2000)),
      der(count('s', 'In neither')),
      der(num('P', 'P(neither)', 'P(neither)', 0, 1, { fraction: 1000 })),
    ],
    rules: [
      limit(
        'both ≤ A, B',
        '{ab} is at most {a} and {b}',
        (v) => v.ab! <= Math.min(v.a!, v.b!),
        'The overlap is part of both circles: it can’t be bigger than either.',
      ),
      limit(
        'A or B ≤ total',
        '{a} + {b} − {ab} is at most {N}',
        (v) => v.a! + v.b! - v.ab! <= v.N!,
        'The circles hold more people than there are in all.',
      ),
      derive(
        'u = a + b − ab',
        '{u} = {a} + {b} − {ab}',
        'u',
        (v) => v.a! + v.b! - v.ab!,
        '{a} + {b} − {ab}',
        'Add the two circles, then take off the overlap counted twice.',
      ),
      derive(
        's = N − u',
        '{s} = {N} − {u}',
        's',
        (v) => v.N! - v.u!,
        '{N} − {u}',
        'Everyone not in either circle.',
      ),
      share('P', 's', 'N', 'The count in neither over everyone.'),
    ],
    example: { a: 22, b: 15, ab: 8, N: 40, u: 29, s: 11, P: 0.275 },
    startWith: ['a', 'b', 'ab', 'N'],
    representation: {
      kind: 'venn',
      chances: {
        a: 'a',
        b: 'b',
        both: 'ab',
        names: ['Soccer', 'Basketball'],
        shade: 'neither',
        result: 'P',
        counts: { total: 'N', count: 's' },
      },
    },
  }),
  page({
    id: 'm.10.probability-rules~sample-space',
    title: 'Listing equally likely outcomes',
    use: 'Use this for “Three coins are tossed. What is the chance of exactly two heads?”',
    assumptions: [
      'A tree lists every outcome: each branch splits into every outcome of the next stage.',
      'When every path is equally likely, P(event) = favorable outcomes ÷ all outcomes.',
      'A stage of 2 is a coin (H, T), of 3 a spinner (R, G, B), of 4 a four-sided die (1 to 4).',
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
      namesBySize: { 2: ['H', 'T'], 3: ['R', 'G', 'B'], 4: ['1', '2', '3', '4'] },
      stages: ['First', 'Second', 'Third'],
      path: [0, 0, 1],
    },
  }),
  countingPage('P'),
  countingPage('C'),
  page({
    id: 'm.10.probability-rules~counting-probability',
    title: 'Probability with combinations',
    use: 'Use this for “3 students are picked at random from 5 girls and 4 boys. What is the chance all 3 are girls? Exactly 2?”',
    assumptions: [
      'Every group of r is equally likely, so count groups with combinations.',
      'Favorable groups: C(a, k) ways to pick k from the first group, times C(b, r − k) for the rest.',
      'All groups: C(a + b, r). The probability is the first over the second.',
    ],
    variables: [
      num('a', 'a', 'First group', 1, 60, { step: 1, integer: true }),
      num('b', 'b', 'Second group', 0, 59, { step: 1, integer: true }),
      num('r', 'r', 'Chosen', 1, 14, { step: 1, integer: true }),
      num('k', 'k', 'Chosen from the first group', 0, 14, { step: 1, integer: true }),
      der(num('n', 'n', 'Everyone', 1, 60, { integer: true })),
      der(num('f', 'f', 'Favorable groups', 0, MOST_WAYS, { integer: true })),
      der(num('t', 't', 'Groups in all', 1, MOST_WAYS, { integer: true })),
      der(num('P', 'P', 'Probability', 0, 1, { fraction: 1000 })),
    ],
    rules: [
      limit(
        'a + b ≤ 60',
        '{a} + {b} is at most 60',
        (v) => v.a! + v.b! <= 60,
        'Keep to 60 people in all.',
      ),
      limit(
        'k ≤ r',
        '{k} is at most {r}',
        (v) => v.k! <= v.r!,
        'The first group can’t give more than the number chosen.',
      ),
      limit(
        'k ≤ a',
        '{k} is at most {a}',
        (v) => v.k! <= v.a!,
        'Choose no more than the first group has.',
      ),
      limit(
        'r − k ≤ b',
        '{r} − {k} is at most {b}',
        (v) => v.r! - v.k! <= v.b!,
        'The rest come from the second group, so it must have r − k people.',
      ),
      total('n', ['a', 'b'], 'Everyone in both groups.'),
      limit(
        'C(n, r) ≤ 10¹²',
        'C({n}, {r}) is at most a trillion',
        (v) => choose(v.n!, v.r!) <= MOST_WAYS,
        'That many groups passes what the page can show: try choosing fewer.',
      ),
      derive(
        'f = C(a, k) × C(b, r − k)',
        '{f} = C({a}, {k}) × C({b}, {r} − {k})',
        'f',
        (v) => choose(v.a!, v.k!) * choose(v.b!, v.r! - v.k!),
        'C({a}, {k}) × C({b}, {r} − {k})',
        'Pick k from the first group and the other r − k from the second: multiply the ways.',
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
    example: { a: 5, b: 4, r: 3, k: 3, n: 9, f: 10, t: 84, P: 10 / 84 },
    startWith: ['a', 'b', 'r', 'k'],
    representation: {
      kind: 'pascalTriangle',
      n: 'n',
      triangle: false,
      slots: { r: 'r', choose: true, result: 't' },
    },
  }),
];

// ─── m.10.constructions ──────────────────────────────────────────────────────

/**
 * p·x + q = r·x + s solved for x (the letter on both sides): the smaller x term is taken from
 * both sides, so the x term left is positive, then the number beside it, then the division.
 */
const bothSides = (x: string) => {
  const left = (v: Values) => v.p! > v.r!;
  const r = rule(
    `${x}: px + q = rx + s`,
    `{p} × {${x}} + {q} = {r} × {${x}} + {s}`,
    {
      [x]: [
        (v) => quot(v.s! - v.q!, v.p! - v.r!),
        (v) => (left(v) ? '({s} − {q}) ÷ ({p} − {r})' : '({q} − {s}) ÷ ({r} − {p})'),
        'Take the smaller x term from both sides, then the number beside the x left, then divide.',
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
  // "3x", "x"; a negative is added back ("Add 7"), never "Take −7".
  const xs = (k: number) => (k === 1 ? 'x' : `${fmt(k)}x`);
  const move = (k: number, text: (n: number) => string) =>
    k < 0 ? `Add ${text(-k)} to both sides` : `Take ${text(k)} from both sides`;
  const plus = (n: number) => (n < 0 ? ` − ${fmt(-n)}` : n > 0 ? ` + ${fmt(n)}` : '');
  r.steps[x]!.work = (v: Values) => {
    const [small, big, keep, gone] = left(v) ? [v.r!, v.p!, v.q!, v.s!] : [v.p!, v.r!, v.s!, v.q!];
    const k = big - small;
    // The x side and the number side, written in the equation's own order.
    const eq = (xSide: string, n: number) =>
      left(v) ? `${xSide} = ${fmt(n)}` : `${fmt(n)} = ${xSide}`;
    return [
      `${move(small, xs)}: ${eq(`${xs(k)}${plus(keep)}`, gone)}`,
      ...(keep ? [`${move(keep, fmt)}: ${eq(xs(k), gone - keep)}`] : []),
      ...(k === 1 ? [] : [`Divide both sides by ${fmt(k)}: x = ${fmt(v[x]!)}`]),
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
      deg('a', 'm∠AOB', 'm∠AOB', 0.1, 179),
      deg('b', 'm∠BOC', 'm∠BOC', 0.1, 179),
      deg('c', 'm∠AOC', 'm∠AOC', 0.2, 180),
    ],
    rules: [sum('c', 'a', 'b', 'The two angles side by side add to the whole angle.')],
    example: { a: 38, b: 47, c: 85 },
    startWith: ['a', 'b'],
    equation: '{a}° + {b}° = {c}°',
    representation: {
      kind: 'markedFigure',
      points: {
        O: [0, 0],
        A: { from: 'O', angle: 0 },
        B: { from: 'O', angle: 'a' },
        C: { from: 'O', angle: 'c' },
      },
      parts: [
        { ray: 'OA' },
        { ray: 'OB' },
        { ray: 'OC' },
        { label: 'AOB', value: 'a' },
        { label: 'BOC', value: 'b' },
        { label: 'AOC', value: 'c', inCaption: true },
      ],
    },
  }),
  page({
    id: 'm.10.constructions~perpendicular-bisector',
    title: 'Construct a perpendicular bisector',
    use: 'Use this for “Construct the perpendicular bisector of a 6 cm segment with the compass open to 4 cm.”',
    assumptions: [
      'Open the compass wider than half of AB; draw an arc from A and one from B.',
      'The arcs cross at P, the same distance r from A and B. The line through P at right angles to AB bisects it at M.',
      'P is MP above M, and the right triangle AMP gives MP² + AM² = r².',
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
    representation: {
      kind: 'markedFigure',
      points: {
        B: [0, 0],
        C: [9, 0],
        D: [12, 0],
        A: { from: 'B', angle: 'b', meets: { from: 'C', angle: 'd' } },
      },
      parts: [
        { segment: 'AB' },
        { segment: 'BC' },
        { segment: 'CA' },
        { segment: 'CD', dashed: true },
        { label: 'BAC', value: 'a' },
        { label: 'ABC', value: 'b' },
        { label: 'ACB', value: 'c' },
        { label: 'ACD', value: 'd' },
      ],
    },
  }),
  // Figure-only values (the drawing's BD, AD and BC) stay out of the steps: sine comes later.
  page({
    id: 'm.10.proofs~isosceles',
    title: 'Base angles of an isosceles triangle',
    use: 'Use this for “Given AB = AC, prove ∠B = ∠C” and “An isosceles triangle has a 40° vertex angle. What are its base angles?”',
    assumptions: [
      'Given: AB = AC. Draw AD, the bisector of ∠A, to meet BC at D.',
      'Step through the proof: each step lights what it uses and what it proves.',
      'The base angles are equal, so each is half of what is left of 180°.',
    ],
    variables: [
      len('s', 's', 'Legs AB = AC', 1000, { unit: 'cm' }),
      deg('A', 'A', 'Vertex angle A', 0.2, 179.8),
      der(deg('B', 'B', 'Base angle B')),
      { ...len('half', 'BD', 'BD', 1000, { min: 1e-9 }), derived: true, hidden: true },
      { ...len('ht', 'AD', 'AD', 1000, { min: 1e-9 }), derived: true, hidden: true },
      { ...len('b', 'BC', 'Base BC', 2000, { min: 1e-9 }), derived: true, hidden: true },
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
            'The two base angles are equal and share what is left of 180°.',
          ],
          A: [(v) => 180 - 2 * v.B!, '180 − 2 × {B}', 'Take both base angles from 180°.'],
        },
        (v) => v.B! - (180 - v.A!) / 2,
      ),
      rule(
        'BD = s sin(A/2)',
        '{half} = {s} × sin({A} ÷ 2)',
        { half: [(v) => v.s! * sin(v.A! / 2), '', ''] },
        (v) => v.half! - v.s! * sin(v.A! / 2),
        { hidden: true },
      ),
      rule(
        'AD = s cos(A/2)',
        '{ht} = {s} × cos({A} ÷ 2)',
        { ht: [(v) => v.s! * cos(v.A! / 2), '', ''] },
        (v) => v.ht! - v.s! * cos(v.A! / 2),
        { hidden: true },
      ),
      rule(
        'BC = 2BD',
        '{b} = 2 × {half}',
        { b: [(v) => 2 * v.half!, '', ''] },
        (v) => v.b! - 2 * v.half!,
        { hidden: true },
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
          {
            given: ['BAD', 'DAC'],
            proved: [],
            text: 'AD bisects ∠A, so ∠BAD ≅ ∠DAC (definition of angle bisector).',
          },
          { given: [], proved: ['AD'], text: 'AD ≅ AD (Reflexive Property).' },
          {
            given: ['AB', 'AC', 'BAD', 'DAC', 'AD'],
            proved: ['△ABD', '△ACD'],
            text: '△ABD ≅ △ACD (SAS).',
          },
          {
            given: ['△ABD', '△ACD'],
            proved: ['ABD', 'ACD'],
            text: '∠B ≅ ∠C (corresponding parts of congruent triangles are congruent).',
          },
        ],
      },
    },
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
      limit(
        'b ≠ b₁',
        '{b2} is not {b1}',
        (v) => Math.abs(v.b2! - v.b1!) > 1e-9,
        'The point is on the given line, so the parallel through it is the line itself.',
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
      marks: true,
      given: { x: 'x0', y: 'y0' },
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
      marks: true,
      given: { x: 'x0', y: 'y0' },
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
/** x′ = s × (the other coordinate): s = 1 swaps them, s = −1 swaps them and changes both signs. */
const swapBy = (to: string, from: string, name: string) =>
  rule(
    `${to} = s × ${from}`,
    `{${to}} = {s} × {${from}}`,
    {
      [to]: [
        (v) => v.s! * v[from]!,
        `{s} × {${from}}`,
        (v: Values) =>
          v.s === 1
            ? `Across y = x, the new ${name} is the old ${name === 'x' ? 'y' : 'x'}.`
            : `Across y = −x, the new ${name} is the old ${name === 'x' ? 'y' : 'x'} with its sign changed.`,
      ],
      [from]: [
        (v) => v.s! * v[to]!,
        `{s} × {${to}}`,
        'Undo the swap: s × s = 1, so multiply the image’s coordinate by s.',
      ],
    },
    (v) => v[to]! - v.s! * v[from]!,
  );
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
      grid('h', 'h', 'Slide right (negative: left)'),
      grid('px', 'x′', 'x of A′'),
      grid('py', 'y′', 'y of A′'),
      grid('qx', 'x″', 'x of A″'),
      grid('qy', 'y″', 'y of A″'),
    ],
    rules: [
      limit(
        'the image stays on the grid',
        '{ax} + {h} is between −7 and 7',
        (v) => Math.abs(v.ax! + v.h!) <= 7,
        'Keep the image on the grid: x + h must be between −7 and 7.',
      ),
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
      grid('px', 'x′', 'x of A′', 8),
      grid('py', 'y′', 'y of A′', 8),
    ],
    rules: [
      limit(
        'the image stays on the grid',
        'The turned point ({a} − ({ay} − {b}), {b} + ({ax} − {a})) is on the grid',
        (v) => Math.abs(v.a! - v.ay! + v.b!) <= 8 && Math.abs(v.b! + v.ax! - v.a!) <= 8,
        'Keep the image on the grid: both of its coordinates must be between −8 and 8.',
      ),
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
    title: 'Reflecting across y = x or y = −x',
    use: 'Use this for “Reflect A(4, 1) across the line y = x” or “across y = −x.”',
    assumptions: [
      'Across y = x the coordinates swap: (x, y) → (y, x).',
      'Across y = −x they swap and both signs change: (x, y) → (−y, −x).',
      'Each point and its image are the same distance from the line, on a segment at right angles to it.',
    ],
    variables: [
      grid('ax', 'x', 'x of A', 6),
      grid('ay', 'y', 'y of A', 6),
      num('s', 's', 'Mirror y = sx: 1 for y = x, −1 for y = −x', -1, 1, {
        step: 1,
        integer: true,
        allowed: [-1, 1],
      }),
      grid('px', 'x′', 'x of A′', 6),
      grid('py', 'y′', 'y of A′', 6),
    ],
    rules: [swapBy('px', 'ay', 'x'), swapBy('py', 'ax', 'y')],
    example: { ax: 4, ay: 1, s: -1, px: -1, py: -4 },
    startWith: ['ax', 'ay', 's'],
    representation: {
      kind: 'transformation',
      figure: [
        ['ax', 'ay'],
        [4, 4],
        [2, 4],
      ],
      move: 'reflect',
      mirror: 'y = −x',
      slope: 's',
      image: { x: 'px', y: 'py' },
      extent: 6,
    },
  }),
  page({
    id: 'm.10.rigid-motions~symmetry',
    title: 'Symmetry of a rectangle',
    use: 'Use this for “Which rotations carry a 6 by 4 rectangle onto itself? How many lines of symmetry does it have?”',
    assumptions: [
      'The rectangle is w squares wide and h tall, and it turns about its center.',
      'A rectangle that isn’t a square has 2 lines of symmetry and is carried onto itself by 180° and 360° turns.',
      'A square (w = h) adds 90° and 270° turns and its two diagonals: 4 lines.',
    ],
    variables: [
      num('w', 'w', 'Width', 1, 8, { step: 1, integer: true }),
      num('h', 'h', 'Height', 1, 8, { step: 1, integer: true }),
      num('t', 't', 'Turn', 90, 360, { unit: '°', allowed: [90, 180, 270, 360] }),
      // The drawing's corners only place the rectangle on the grid.
      {
        ...num('r', 'r', 'Right side at x =', 2, 9, { integer: true }),
        derived: true,
        hidden: true,
      },
      { ...num('u', 'u', 'Top side at y =', 2, 9, { integer: true }), derived: true, hidden: true },
      der(num('L', 'L', 'Lines of symmetry', 2, 4, { integer: true })),
      der(num('n', 'n', 'Order of rotational symmetry', 2, 4, { integer: true })),
      der(num('f', 'f', 'Carried onto itself (1 yes, 0 no)', 0, 1, { integer: true })),
    ],
    rules: [
      rule('r = 1 + w', '{r} = 1 + {w}', { r: [(v) => 1 + v.w!, '', ''] }, (v) => v.r! - 1 - v.w!, {
        hidden: true,
      }),
      rule('u = 1 + h', '{u} = 1 + {h}', { u: [(v) => 1 + v.h!, '', ''] }, (v) => v.u! - 1 - v.h!, {
        hidden: true,
      }),
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
      (() => {
        const r = pick(
          'f from t and n',
          '{f}: does a turn of {t} carry it onto itself, order {n}',
          'f',
          (v) => (Math.round(v.t! * v.n!) % 360 === 0 ? 1 : 0),
          (v) =>
            Math.round(v.t! * v.n!) % 360 === 0
              ? 'The turn is a whole number of 360° ÷ n steps: the figure lands on itself.'
              : 'The turn is not a whole number of 360° ÷ n steps: the figure lands turned.',
        );
        r.steps.f!.note = (v: Values) => (v.f ? '(yes)' : '(no)');
        return r;
      })(),
    ],
    example: { w: 6, h: 4, t: 180, r: 7, u: 5, L: 2, n: 2, f: 1 },
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
      about: 'center',
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
    ],
    variables: [
      coefficient('p', 'x coefficient of AB'),
      constant('q', 'Number in AB', 100),
      coefficient('r', 'x coefficient of DE'),
      constant('s', 'Number in DE', 100),
      der(num('x', 'x', 'x', -1000, 1000)),
      der(num('L', 'AB', 'AB = DE', -1e5, 1e5)),
      // The drawing's other two sides: a 3-4-5 shape on AB.
      { ...len('bc', 'BC', 'BC', 1e5, { min: 1e-9 }), derived: true, hidden: true },
      { ...len('ac', 'AC', 'AC', 1e5, { min: 1e-9 }), derived: true, hidden: true },
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
        'AB > 0',
        '{L} is more than 0',
        (v) => v.L! > 0,
        'A length can’t be 0 or less: this x gives no segment.',
      ),
      rule(
        'BC = 0.8 AB',
        '{bc} = 0.8 × {L}',
        { bc: [(v) => (v.L! > 0 ? 0.8 * v.L! : undefined), '', ''] },
        (v) => v.bc! - 0.8 * v.L!,
        { hidden: true },
      ),
      rule(
        'AC = 0.6 AB',
        '{ac} = 0.6 × {L}',
        { ac: [(v) => (v.L! > 0 ? 0.6 * v.L! : undefined), '', ''] },
        (v) => v.ac! - 0.6 * v.L!,
        { hidden: true },
      ),
    ],
    example: { p: 3, q: 2, r: 1, s: 14, x: 6, L: 20, bc: 16, ac: 12 },
    startWith: ['p', 'q', 'r', 's'],
    equation: '{p}x + {q} = {r}x + {s}',
    representation: {
      kind: 'triangleSolver',
      parts: { c: 'L', a: 'bc', b: 'ac' },
      congruence: {},
    },
  }),
];

// ─── m.10.triangle-relationships ─────────────────────────────────────────────

const TRIANGLE_RELATIONSHIPS: ModuleDef[] = [
  page({
    id: 'm.10.triangle-relationships',
    assumptions: [
      'D and E are the midpoints of AB and AC; the segment DE joining them is a midsegment.',
      'The midsegment is parallel to the third side BC and half as long: DE = BC ÷ 2.',
    ],
    variables: [
      len('a', 'a', 'Side BC', 1000, { min: 0.1 }),
      len('b', 'b', 'Side CA', 1000, { min: 0.1 }),
      len('c', 'c', 'Side AB', 1000, { min: 0.1 }),
      der(len('m', 'DE', 'Midsegment DE', 500)),
    ],
    rules: [
      closes('a', 'b', 'c'),
      derive(
        'DE = BC/2',
        '{m} = {a} ÷ 2',
        'm',
        (v) => v.a! / 2,
        '{a} ÷ 2',
        'The midsegment is half the third side.',
      ),
    ],
    example: { a: 14, b: 12, c: 10, m: 7 },
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'markedFigure',
      triangle: { sides: ['a', 'b', 'c'], lines: 'midsegment', labels: { DE: 'm', BC: 'a' } },
    },
  }),
  page({
    id: 'm.10.triangle-relationships~centroid',
    title: 'Medians and the centroid',
    use: 'Use this for “The median AD is 12. How long are AG and GD?”',
    assumptions: [
      'A median joins a corner to the midpoint of the opposite side.',
      'The three medians meet at the centroid G, two thirds of the way from each corner.',
      'So AG = 2/3 of AD and GD = 1/3 of AD: AG is twice GD.',
    ],
    variables: [
      len('m', 'AD', 'Median AD'),
      len('g', 'AG', 'AG', 1000, { min: 0.001 }),
      len('k', 'GD', 'GD', 1000, { min: 0.001 }),
    ],
    rules: [
      rule(
        'AG = 2/3 AD',
        '{g} = 2 × {m} ÷ 3',
        {
          g: [
            (v) => (2 * v.m!) / 3,
            '2 × {m} ÷ 3',
            'The centroid is two thirds of the way from the corner.',
          ],
          m: [(v) => (3 * v.g!) / 2, '3 × {g} ÷ 2', 'AG is two thirds of the median.'],
        },
        (v) => v.g! - (2 * v.m!) / 3,
      ),
      rule(
        'GD = 1/3 AD',
        '{k} = {m} ÷ 3',
        {
          k: [(v) => v.m! / 3, '{m} ÷ 3', 'The last third of the median.'],
          m: [(v) => 3 * v.k!, '3 × {k}', 'GD is one third of the median.'],
        },
        (v) => v.k! - v.m! / 3,
      ),
    ],
    example: { m: 12, g: 8, k: 4 },
    startWith: ['m'],
    representation: {
      kind: 'markedFigure',
      points: { B: [0, 0], C: ['g', 0], D: ['k', 0], A: ['k', 'm'], G: ['k', 'k'] },
      parts: [
        { segment: 'AB' },
        { segment: 'AC' },
        { segment: 'BC' },
        { segment: 'AD' },
        { ticks: 'BD', count: 1 },
        { ticks: 'DC', count: 1 },
        { label: 'AG', value: 'g' },
        { label: 'GD', value: 'k' },
        { label: 'AD', value: 'm', inCaption: true },
      ],
    },
  }),
  page({
    id: 'm.10.triangle-relationships~incenter',
    title: 'The incircle of a right triangle',
    use: 'Use this for “A right triangle has legs 9 and 12. Find the radius of the circle inside it.”',
    assumptions: [
      'The angle bisectors meet at the incenter I, the same distance r from all three sides.',
      'The two tangent lengths from each corner are equal, and at the right angle they are both r.',
      'So the legs share the hypotenuse plus 2r: r = (a + b − c) ÷ 2.',
    ],
    variables: [
      len('a', 'a', 'Leg BC', 1000, { min: 0.1 }),
      len('b', 'b', 'Leg CA', 1000, { min: 0.1 }),
      der(len('c', 'c', 'Hypotenuse AB', 1500)),
      der(len('r', 'r', 'Inradius r', 500)),
    ],
    rules: [
      derive(
        'c = √(a² + b²)',
        '{c} = √({a}² + {b}²)',
        'c',
        (v) => Math.hypot(v.a!, v.b!),
        '√({a}² + {b}²)',
        'The Pythagorean theorem gives the hypotenuse.',
      ),
      derive(
        'r = (a + b − c)/2',
        '{r} = ({a} + {b} − {c}) ÷ 2',
        'r',
        (v) => (v.a! + v.b! - v.c!) / 2,
        '({a} + {b} − {c}) ÷ 2',
        'The legs are the hypotenuse plus two radii: take c away and halve.',
      ),
    ],
    example: { a: 9, b: 12, c: 15, r: 3 },
    startWith: ['a', 'b'],
    representation: {
      kind: 'markedFigure',
      triangle: { sides: ['a', 'b', 'c'], lines: 'bisector', center: true, labels: { IT: 'r' } },
    },
  }),
  page({
    id: 'm.10.triangle-relationships~circumcenter',
    title: 'The circle through the corners of a right triangle',
    use: 'Use this for “A right triangle has legs 5 and 12. Find the radius of the circle through its corners.”',
    assumptions: [
      'The perpendicular bisectors of the sides meet at the circumcenter O, the same distance R from all three corners.',
      'In a right triangle O is the midpoint of the hypotenuse, so R = c ÷ 2.',
      'For other triangles, construct the bisectors: O is where they meet.',
    ],
    variables: [
      len('a', 'a', 'Leg BC', 1000, { min: 0.1 }),
      len('b', 'b', 'Leg CA', 1000, { min: 0.1 }),
      der(len('c', 'c', 'Hypotenuse AB', 1500)),
      der(len('R', 'R', 'Circumradius R', 750)),
    ],
    rules: [
      derive(
        'c = √(a² + b²)',
        '{c} = √({a}² + {b}²)',
        'c',
        (v) => Math.hypot(v.a!, v.b!),
        '√({a}² + {b}²)',
        'The Pythagorean theorem gives the hypotenuse.',
      ),
      derive(
        'R = c/2',
        '{R} = {c} ÷ 2',
        'R',
        (v) => v.c! / 2,
        '{c} ÷ 2',
        'The circumcenter is the midpoint of the hypotenuse.',
      ),
    ],
    example: { a: 5, b: 12, c: 13, R: 6.5 },
    startWith: ['a', 'b'],
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
  page({
    id: 'm.10.triangle-relationships~inequality',
    title: 'The triangle inequality',
    use: 'Use this for “Two sides of a triangle are 7 and 11. What lengths can the third side be?”',
    assumptions: [
      'Any two sides of a triangle add to more than the third.',
      'So the third side is more than the difference of the other two and less than their sum.',
      'The longest side is across from the largest angle.',
    ],
    variables: [
      len('a', 'a', 'Side a', 1000, { min: 0.1 }),
      len('b', 'b', 'Side b', 1000, { min: 0.1 }),
      der(num('lo', 'low', 'Third side is more than', 0, 1000)),
      der(num('hi', 'high', 'Third side is less than', 0, 2000)),
      { ...len('c', 'c', 'A third side that fits', 1000), derived: true, hidden: true },
    ],
    rules: [
      derive(
        'low = |a − b|',
        '{lo} = |{a} − {b}|',
        'lo',
        (v) => Math.abs(v.a! - v.b!),
        '|{a} − {b}|',
        'The third side must be longer than the difference.',
      ),
      derive(
        'high = a + b',
        '{hi} = {a} + {b}',
        'hi',
        (v) => v.a! + v.b!,
        '{a} + {b}',
        'The third side must be shorter than the sum. So |a − b| < third side < a + b.',
      ),
      rule(
        'c = (low + high)/2',
        '{c} = ({lo} + {hi}) ÷ 2',
        { c: [(v) => (v.lo! + v.hi!) / 2, '', ''] },
        (v) => v.c! - (v.lo! + v.hi!) / 2,
        { hidden: true },
      ),
    ],
    example: { a: 7, b: 11, lo: 4, hi: 18, c: 11 },
    startWith: ['a', 'b'],
    representation: { kind: 'triangleSolver', parts: { a: 'a', b: 'b', c: 'c' } },
  }),
];

// ─── m.10.quadrilaterals ─────────────────────────────────────────────────────

const QUADRILATERALS: ModuleDef[] = [
  page({
    id: 'm.10.quadrilaterals',
    assumptions: [
      'The diagonals from one corner cut a convex polygon with n sides into n − 2 triangles.',
      'Each triangle’s angles add to 180°, so the interior angles add to (n − 2) × 180°.',
      'A regular polygon’s angles are equal: each is the sum ÷ n. Its exterior angles add to 360°, so each is 360° ÷ n.',
    ],
    variables: [
      num('n', 'n', 'Number of sides', 3, 30, { step: 1, integer: true }),
      num('S', 'S', 'Sum of the interior angles', 180, 5040, { unit: '°', step: 1 }),
      deg('e', 'e', 'Each interior angle', 60, 168),
      deg('x', 'x', 'Each exterior angle', 12, 120),
    ],
    rules: [
      rule(
        'S = (n − 2) × 180',
        '{S} = ({n} − 2) × 180',
        {
          S: [
            (v) => (v.n! - 2) * 180,
            '({n} − 2) × 180',
            'The n − 2 triangles from one corner each add 180°.',
          ],
          n: [(v) => v.S! / 180 + 2, '{S} ÷ 180 + 2', 'Count the triangles, then add 2.'],
        },
        (v) => v.S! - (v.n! - 2) * 180,
      ),
      rule(
        'e = S/n',
        '{e} = {S} ÷ {n}',
        {
          e: [(v) => v.S! / v.n!, '{S} ÷ {n}', 'The n equal angles share the sum.'],
          S: [(v) => v.e! * v.n!, '{e} × {n}', 'n equal angles make the sum.'],
          n: [(v) => v.S! / v.e!, '{S} ÷ {e}', 'How many equal angles make the sum.'],
        },
        (v) => v.e! * v.n! - v.S!,
      ),
      rule(
        'x = 360/n',
        '{x} = 360 ÷ {n}',
        {
          x: [(v) => 360 / v.n!, '360 ÷ {n}', 'The n equal exterior angles add to 360°.'],
          n: [(v) => 360 / v.x!, '360 ÷ {x}', 'How many equal exterior angles make 360°.'],
        },
        (v) => v.x! * v.n! - 360,
      ),
    ],
    example: { n: 9, S: 1260, e: 140, x: 40 },
    startWith: ['n'],
    representation: {
      kind: 'markedFigure',
      regular: {
        sides: 'n',
        triangles: true,
        exterior: true,
        labels: { sum: 'S', interior: 'e', exterior: 'x' },
      },
    },
  }),
  page({
    id: 'm.10.quadrilaterals~parallelogram',
    title: 'Angles of a parallelogram',
    use: 'Use this for “In parallelogram ABCD, m∠A = 58°. Find m∠B and m∠C.”',
    assumptions: [
      'Opposite sides are parallel and equal, and the diagonals cut each other in half.',
      'Angles next to each other add to 180°, because the sides are parallel.',
      'Opposite angles are equal: m∠C = m∠A and m∠D = m∠B.',
    ],
    variables: [deg('A', 'm∠A', 'm∠A'), der(deg('B', 'm∠B', 'm∠B')), der(deg('C', 'm∠C', 'm∠C'))],
    rules: [
      supplement('A', 'B', 'Angles next to each other in a parallelogram add to 180°.'),
      equal('A', 'C', 'Opposite angles of a parallelogram are equal.'),
    ],
    example: { A: 58, B: 122, C: 58 },
    startWith: ['A'],
    representation: {
      kind: 'markedFigure',
      quadrilateral: {
        family: 'parallelogram',
        width: 7,
        height: 4,
        angle: 'A',
        diagonals: true,
        labels: { DAB: 'A', ABC: 'B', BCD: 'C' },
      },
    },
  }),
  page({
    id: 'm.10.quadrilaterals~rectangle',
    title: 'Rectangle and its diagonals',
    use: 'Use this for “A rectangle is 12 by 5. How long is each diagonal?”',
    assumptions: [
      'A rectangle is a parallelogram with four right angles.',
      'Its diagonals are congruent and bisect each other.',
      'Each diagonal is the hypotenuse of a right triangle with legs w and h: d² = w² + h².',
    ],
    variables: [
      len('w', 'w', 'Width', 1000, { min: 0.1 }),
      len('h', 'h', 'Height', 1000, { min: 0.1 }),
      len('d', 'd', 'Diagonal', 1500, { min: 0.1 }),
    ],
    rules: [pythagoras('w', 'h', 'd', 'The diagonal is the hypotenuse of a right triangle.')],
    example: { w: 12, h: 5, d: 13 },
    startWith: ['w', 'h'],
    representation: {
      kind: 'markedFigure',
      quadrilateral: {
        family: 'rectangle',
        width: 'w',
        height: 'h',
        diagonals: true,
        labels: { AB: 'w', BC: 'h', AC: 'd' },
      },
    },
  }),
  page({
    id: 'm.10.quadrilaterals~rhombus',
    title: 'Rhombus from its diagonals',
    use: 'Use this for “A rhombus has diagonals 12 and 16. Find its side and its area.”',
    assumptions: [
      'The diagonals of a rhombus bisect each other at right angles.',
      'Half of each diagonal makes the legs of a right triangle whose hypotenuse is a side.',
      'The area is half the product of the diagonals: K = pq ÷ 2.',
    ],
    variables: [
      len('p', 'p', 'Diagonal AC', 1000, { min: 0.1 }),
      len('q', 'q', 'Diagonal BD', 1000, { min: 0.1 }),
      der(len('hp', 'AO', 'Half of AC (AO)', 500)),
      der(len('hq', 'BO', 'Half of BD (BO)', 500)),
      der(len('s', 's', 'Side', 1000)),
      der(num('K', 'K', 'Area', 0, 1e6)),
    ],
    rules: [
      derive(
        'AO = p/2',
        '{hp} = {p} ÷ 2',
        'hp',
        (v) => v.p! / 2,
        '{p} ÷ 2',
        'The diagonals bisect each other.',
      ),
      derive(
        'BO = q/2',
        '{hq} = {q} ÷ 2',
        'hq',
        (v) => v.q! / 2,
        '{q} ÷ 2',
        'The diagonals bisect each other.',
      ),
      derive(
        's = √(AO² + BO²)',
        '{s} = √({hp}² + {hq}²)',
        's',
        (v) => Math.hypot(v.hp!, v.hq!),
        '√({hp}² + {hq}²)',
        'The half diagonals meet at a right angle: the side is the hypotenuse.',
      ),
      derive(
        'K = pq/2',
        '{K} = {p} × {q} ÷ 2',
        'K',
        (v) => (v.p! * v.q!) / 2,
        '{p} × {q} ÷ 2',
        'The diagonals cut the rhombus into four right triangles: half of p × q.',
      ),
    ],
    example: { p: 12, q: 16, hp: 6, hq: 8, s: 10, K: 96 },
    startWith: ['p', 'q'],
    pictureLabels: ['p', 'q', 'K'],
    representation: {
      kind: 'markedFigure',
      quadrilateral: {
        family: 'rhombus',
        across: ['p', 'q'],
        diagonals: true,
        labels: { AB: 's', AO: 'hp', BO: 'hq' },
      },
    },
  }),
  page({
    id: 'm.10.quadrilaterals~trapezoid',
    title: 'Trapezoid midsegment and area',
    use: 'Use this for “A trapezoid has bases 9 and 15 and height 5. Find its midsegment and area.”',
    assumptions: [
      'A trapezoid has exactly one pair of parallel sides, the bases.',
      'The midsegment joins the midpoints of the legs: it is parallel to the bases and their mean.',
      'The area is the midsegment times the height.',
    ],
    variables: [
      len('w', 'b₁', 'Base AB', 1000, { min: 0.1 }),
      len('t', 'b₂', 'Base DC', 1000, { min: 0.1 }),
      len('h', 'h', 'Height', 1000, { min: 0.1 }),
      der(len('m', 'm', 'Midsegment', 1000)),
      der(num('K', 'K', 'Area', 0, 1e6)),
    ],
    rules: [
      derive(
        'm = (b₁ + b₂)/2',
        '{m} = ({w} + {t}) ÷ 2',
        'm',
        (v) => (v.w! + v.t!) / 2,
        '({w} + {t}) ÷ 2',
        'The midsegment is the mean of the bases.',
      ),
      derive(
        'K = mh',
        '{K} = {m} × {h}',
        'K',
        (v) => v.m! * v.h!,
        '{m} × {h}',
        'The midsegment times the height.',
      ),
    ],
    example: { w: 15, t: 9, h: 5, m: 12, K: 60 },
    startWith: ['w', 't', 'h'],
    representation: {
      kind: 'markedFigure',
      quadrilateral: {
        family: 'trapezoid',
        width: 'w',
        top: 't',
        height: 'h',
        angle: 70,
        labels: { AB: 'w', DC: 't' },
      },
    },
  }),
  page({
    id: 'm.10.quadrilaterals~kite',
    title: 'Kite',
    use: 'Use this for “A kite’s diagonals cross at O; BD = 12, OA = 8 and OC = 4.5. How long are its sides?”',
    assumptions: [
      'A kite has two pairs of equal sides next to each other: AB = AD and CB = CD.',
      'Its diagonals cross at right angles, and diagonal AC cuts BD in half.',
      'So each side is the hypotenuse of a right triangle with legs half of BD and OA or OC.',
    ],
    variables: [
      len('w', 'BD', 'Diagonal BD', 1000, { min: 0.1 }),
      len('u', 'OA', 'OA', 1000, { min: 0.1 }),
      len('l', 'OC', 'OC', 1000, { min: 0.1 }),
      der(len('s', 'AB', 'Side AB = AD', 1500)),
      der(len('k', 'CB', 'Side CB = CD', 1500)),
    ],
    rules: [
      derive(
        'AB² = (BD/2)² + OA²',
        '{s} = √(({w} ÷ 2)² + {u}²)',
        's',
        (v) => Math.hypot(v.w! / 2, v.u!),
        '√(({w} ÷ 2)² + {u}²)',
        'AB is the hypotenuse of the right triangle AOB.',
      ),
      derive(
        'CB² = (BD/2)² + OC²',
        '{k} = √(({w} ÷ 2)² + {l}²)',
        'k',
        (v) => Math.hypot(v.w! / 2, v.l!),
        '√(({w} ÷ 2)² + {l}²)',
        'CB is the hypotenuse of the right triangle COB.',
      ),
    ],
    example: { w: 12, u: 8, l: 4.5, s: 10, k: 7.5 },
    startWith: ['w', 'u', 'l'],
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
  page({
    id: 'm.10.quadrilaterals~regular-area',
    title: 'Area of a regular polygon',
    use: 'Use this for “A regular hexagon has sides of 4 cm. Find its apothem and its area.”',
    assumptions: [
      'A regular polygon has n equal sides; the apothem a runs from the center to a side’s midpoint, at right angles.',
      'Lines to the corners cut it into n triangles of base s and height a, so K = ½ × a × P.',
      'Each triangle’s angle at the center is 360° ÷ n; the apothem halves it: θ = 180° ÷ n.',
    ],
    variables: [
      num('n', 'n', 'Number of sides', 3, 12, { step: 1, integer: true }),
      len('s', 's', 'Side', 1000, { unit: 'cm', units: ['mm', 'cm', 'm'], min: 0.1 }),
      len('P', 'P', 'Perimeter', 12000, { unit: 'cm', units: ['mm', 'cm', 'm'] }),
      der(deg('t', 'θ', 'Half the angle at the center', 15, 60)),
      der(len('a', 'a', 'Apothem', 5000, { unit: 'cm', units: ['mm', 'cm', 'm'] })),
      der(num('K', 'K', 'Area', 0, 1e8, { unit: 'cm²', units: ['mm²', 'cm²', 'm²'] })),
    ],
    rules: [
      rule(
        'P = ns',
        '{P} = {n} × {s}',
        {
          P: [(v) => v.n! * v.s!, '{n} × {s}', 'The perimeter is n equal sides of length s.'],
          s: [(v) => quot(v.P!, v.n!), '{P} ÷ {n}', 'Share the perimeter among the n equal sides.'],
        },
        (v) => v.P! - v.n! * v.s!,
      ),
      derive(
        'θ = 180° ÷ n',
        '{t} = 180 ÷ {n}',
        't',
        (v) => 180 / v.n!,
        '180 ÷ {n}',
        'The n angles at the center make 360°, and the apothem cuts each in half.',
      ),
      derive(
        'a = s ÷ (2 tan θ)',
        '{a} = {s} ÷ (2 × tan({t}°))',
        'a',
        (v) => quot(v.s!, 2 * tan(v.t!)),
        '{s} ÷ (2 × tan({t}°))',
        'In the right triangle at the center, tan θ is half a side over the apothem.',
      ),
      derive(
        'K = ½aP',
        '{K} = {a} × {P} ÷ 2',
        'K',
        (v) => (v.a! * v.P!) / 2,
        '{a} × {P} ÷ 2',
        'The n triangles together: ½ × apothem × all their bases.',
      ),
    ],
    example: { n: 6, s: 4, P: 24, t: 30, a: 2 * Math.sqrt(3), K: 24 * Math.sqrt(3) },
    startWith: ['n', 's'],
    unitSystems: ['metric'],
    representation: {
      kind: 'polygon',
      sides: 'n',
      side: 's',
      apothem: 'a',
      angle: 't',
      around: 'P',
      area: 'K',
    },
  }),
];

export const MATH_10_MODULES: ModuleDef[] = [
  ...CONSTRUCTIONS,
  ...PROOFS,
  ...PARALLEL_LINES,
  ...RIGID_MOTIONS,
  ...CONGRUENCE,
  ...TRIANGLE_RELATIONSHIPS,
  ...QUADRILATERALS,
  ...SIMILARITY,
  ...SPECIAL,
  ...TRIG,
  ...LAW_SINES_COSINES,
  ...COORDINATES,
  ...CIRCLE_THEOREMS,
  ...CIRCLE_EQUATIONS,
  ...ARC_SECTOR,
  ...VOLUME,
  ...MODELING,
  ...PROBABILITY_RULES,
  ...CONDITIONAL,
];
