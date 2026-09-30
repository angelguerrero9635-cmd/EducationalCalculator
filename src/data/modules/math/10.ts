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

export const MATH_10_MODULES: ModuleDef[] = [...TRIG];
