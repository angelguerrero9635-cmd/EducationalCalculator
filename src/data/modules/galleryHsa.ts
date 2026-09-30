/**
 * Grades 9–12 gallery demos (group HA; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 *
 * H01 `functionGraph`: one demo per function family and mode, ids `g.<skill>-<case>`.
 */
import type { Values } from '@/engine/types';
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;

/** A value on a graph: −lim to lim in steps of `step`. */
const num = (id: string, symbol: string, name: string, min = -20, max = 20, step = 0.1) => ({
  id,
  symbol,
  name,
  min,
  max,
  step,
});
/** A value the rule works out (wide range, no drag step). */
const out = (id: string, symbol: string, name: string, lim = 1e9) => ({
  id,
  symbol,
  name,
  min: -lim,
  max: lim,
});

/**
 * A relation with its steps: for each variable it is solved for, the solver, the rearranged
 * right side and the explanation.
 */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how']]>,
) {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = fn;
    if (fn.length > 0) steps[v] = { expr, how };
  }
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A page from its rules: the relations and the steps keyed by relation. */
function page(
  m: Omit<ModuleDef, 'relations' | 'steps'> & { rules: ReturnType<typeof rule>[] },
): ModuleDef {
  const { rules, ...rest } = m;
  return {
    ...rest,
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

const ln = Math.log;
/** A positive result, or nothing (a log or root out of its domain). */
const pos = (x: number) => (x > 0 && Number.isFinite(x) ? x : undefined);
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);

export const HSA_GALLERY_MODULES: ModuleDef[] = [
  // ── Linear: f(x) = mx + b, function notation ──
  page({
    id: 'g.m9-function-notation-linear',
    title: 'Function notation: a linear function',
    use: 'Use this for evaluating f(x) = mx + b, or finding the x that gives an output.',
    assumptions: [
      'f(x) = mx + b: the output for input x.',
      'The slope m is the change in f(x) for each 1 across; b is f(0).',
      'Drag the point along the line, the intercept, or the slope handle at x = 1.',
    ],
    variables: [
      num('m', 'm', 'Slope', -10, 10, 0.5),
      num('b', 'b', 'Intercept', -20, 20, 0.5),
      num('x', 'x', 'Input', -20, 20, 0.5),
      out('y', 'f(x)', 'Output'),
    ],
    rules: [
      rule(
        'f(x) = mx + b',
        '{y} = {m}{x} + {b}',
        ['y', 'm', 'x', 'b'],
        (v) => v.y! - (v.m! * v.x! + v.b!),
        {
          y: [
            (v) => v.m! * v.x! + v.b!,
            '{m} × {x} + {b}',
            'Multiply the input by the slope, then add the intercept.',
          ],
          x: [
            (v) => (v.m === 0 ? undefined : (v.y! - v.b!) / v.m!),
            '({y} − {b}) ÷ {m}',
            'Subtract b from both sides, then divide by m.',
          ],
          b: [(v) => v.y! - v.m! * v.x!, '{y} − {m} × {x}', 'Subtract mx from both sides.'],
          m: [
            (v) => (v.x === 0 ? undefined : (v.y! - v.b!) / v.x!),
            '({y} − {b}) ÷ {x}',
            'Subtract b from both sides, then divide by x.',
          ],
        },
      ),
    ],
    example: { m: 2, b: -3, x: 4, y: 5 },
    startWith: ['x', 'm', 'b'],
    representation: {
      kind: 'functionGraph',
      family: 'linear',
      m: 'm',
      b: 'b',
      at: { x: 'x', y: 'y' },
      marks: ['zeros', 'intercept'],
    },
  }),

  // ── Absolute value: f(x) = a|x − h| + k ──
  page({
    id: 'g.m9-absolute-value-vertex',
    title: 'Absolute value function',
    use: 'Use this for graphing f(x) = a|x − h| + k and solving |x − h| equations from a graph.',
    assumptions: [
      'f(x) = a|x − h| + k is a V with its vertex at (h, k).',
      'a stretches the V (a < 0 turns it upside down).',
      'Drag the vertex, the stretch handle one to the right of it, or the point.',
    ],
    variables: [
      num('a', 'a', 'Stretch', -10, 10, 0.5),
      num('h', 'h', 'Shift right'),
      num('k', 'k', 'Shift up'),
      num('x', 'x', 'Input'),
      out('y', 'f(x)', 'Output'),
    ],
    rules: [
      rule(
        'f(x) = a|x − h| + k',
        '{y} = {a} × |{x} − {h}| + {k}',
        ['y', 'a', 'x', 'h', 'k'],
        (v) => v.y! - (v.a! * Math.abs(v.x! - v.h!) + v.k!),
        {
          y: [
            (v) => v.a! * Math.abs(v.x! - v.h!) + v.k!,
            '{a} × |{x} − {h}| + {k}',
            'Take the distance from x to h, stretch it by a, then add k.',
          ],
          x: [
            (v) =>
              v.a === 0 || (v.y! - v.k!) / v.a! < 0
                ? undefined
                : [v.h! - (v.y! - v.k!) / v.a!, v.h! + (v.y! - v.k!) / v.a!],
            '{h} ± ({y} − {k}) ÷ {a}',
            'Subtract k and divide by a to get |x − h|; x is that far from h on either side.',
          ],
          k: [
            (v) => v.y! - v.a! * Math.abs(v.x! - v.h!),
            '{y} − {a} × |{x} − {h}|',
            'Subtract a|x − h| from both sides.',
          ],
          a: [
            (v) => (v.x === v.h ? undefined : (v.y! - v.k!) / Math.abs(v.x! - v.h!)),
            '({y} − {k}) ÷ |{x} − {h}|',
            'Subtract k, then divide by |x − h|.',
          ],
        },
      ),
    ],
    example: { a: 2, h: 1, k: -4, x: 4, y: 2 },
    startWith: ['x', 'a', 'h', 'k'],
    representation: {
      kind: 'functionGraph',
      family: 'absolute',
      a: 'a',
      h: 'h',
      k: 'k',
      at: { x: 'x', y: 'y' },
      marks: ['vertex', 'zeros', 'range'],
    },
  }),

  // ── Quadratic, vertex form ──
  page({
    id: 'g.m9-quadratic-functions-vertex',
    title: 'Quadratic in vertex form',
    use: 'Use this for graphing f(x) = a(x − h)² + k: the vertex, the axis of symmetry and the zeros.',
    assumptions: [
      'f(x) = a(x − h)² + k has its vertex at (h, k) and its axis of symmetry at x = h.',
      'a > 0 opens up, a < 0 opens down; a bigger |a| is narrower.',
      'Drag the vertex, the stretch handle one to the right of it, or the point.',
    ],
    variables: [
      num('a', 'a', 'Stretch', -10, 10, 0.5),
      num('h', 'h', 'Vertex x'),
      num('k', 'k', 'Vertex y'),
      num('x', 'x', 'Input'),
      out('y', 'f(x)', 'Output'),
    ],
    rules: [
      rule(
        'f(x) = a(x − h)² + k',
        '{y} = {a} × ({x} − {h})² + {k}',
        ['y', 'a', 'x', 'h', 'k'],
        (v) => v.y! - (v.a! * (v.x! - v.h!) ** 2 + v.k!),
        {
          y: [
            (v) => v.a! * (v.x! - v.h!) ** 2 + v.k!,
            '{a} × ({x} − {h})² + {k}',
            'Square the distance from h, multiply by a, then add k.',
          ],
          x: [
            (v) => {
              const s = v.a === 0 ? -1 : (v.y! - v.k!) / v.a!;
              return s < 0 ? undefined : [v.h! - Math.sqrt(s), v.h! + Math.sqrt(s)];
            },
            '{h} ± √(({y} − {k}) ÷ {a})',
            'Subtract k, divide by a, then take the square root: two inputs, one each side of the axis.',
          ],
          k: [
            (v) => v.y! - v.a! * (v.x! - v.h!) ** 2,
            '{y} − {a} × ({x} − {h})²',
            'Subtract a(x − h)² from both sides.',
          ],
          a: [
            (v) => (v.x === v.h ? undefined : (v.y! - v.k!) / (v.x! - v.h!) ** 2),
            '({y} − {k}) ÷ ({x} − {h})²',
            'Subtract k, then divide by (x − h)².',
          ],
        },
      ),
    ],
    example: { a: 0.5, h: 2, k: -2, x: 6, y: 6 },
    startWith: ['x', 'a', 'h', 'k'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'vertex',
      a: 'a',
      h: 'h',
      k: 'k',
      at: { x: 'x', y: 'y' },
      marks: ['vertex', 'zeros', 'intercept'],
    },
  }),

  // ── Quadratic, standard form: the vertex from −b/(2a) ──
  page({
    id: 'g.m9-quadratic-functions-standard',
    title: 'Quadratic in standard form',
    use: 'Use this for finding the vertex of f(x) = ax² + bx + c from h = −b/(2a).',
    assumptions: [
      'f(x) = ax² + bx + c; its axis of symmetry is x = −b/(2a).',
      'The vertex is (h, f(h)); c is the y-intercept.',
      'Drag the vertex (b and c follow) or the stretch handle.',
    ],
    variables: [
      num('a', 'a', 'Leading coefficient', -10, 10, 0.5),
      num('b', 'b', 'Linear coefficient'),
      num('c', 'c', 'Constant'),
      { ...out('h', 'h', 'Vertex x'), derived: true },
      { ...out('k', 'k', 'Vertex y'), derived: true },
    ],
    rules: [
      rule('h = −b/(2a)', '{h} = −{b}/(2 × {a})', ['h', 'b', 'a'], (v) => v.h! * 2 * v.a! + v.b!, {
        h: [
          (v) => (v.a === 0 ? undefined : -v.b! / (2 * v.a!)),
          '−{b} ÷ (2 × {a})',
          'The axis of symmetry is halfway between the zeros, at −b/(2a).',
        ],
        b: [(v) => -2 * v.a! * v.h!, '−2 × {a} × {h}', 'Multiply both sides by −2a.'],
      }),
      rule(
        'k = c − b²/(4a)',
        '{k} = {c} − {b}²/(4 × {a})',
        ['k', 'c', 'b', 'a'],
        (v) => v.k! - (v.c! - v.b! ** 2 / (4 * v.a!)),
        {
          k: [
            (v) => (v.a === 0 ? undefined : v.c! - v.b! ** 2 / (4 * v.a!)),
            '{c} − {b}² ÷ (4 × {a})',
            'Put h = −b/(2a) into ax² + bx + c.',
          ],
          c: [
            (v) => (v.a === 0 ? undefined : v.k! + v.b! ** 2 / (4 * v.a!)),
            '{k} + {b}² ÷ (4 × {a})',
            'Add b²/(4a) to both sides.',
          ],
        },
      ),
    ],
    example: { a: 1, b: -2, c: -3, h: 1, k: -4 },
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'a',
      b: 'b',
      c: 'c',
      shows: { vertex: { x: 'h', y: 'k' } },
      marks: ['vertex', 'zeros', 'intercept'],
    },
  }),

  // ── Quadratic formula: zeros written exactly ──
  page({
    id: 'g.m9-quadratic-formula-zeros',
    title: 'The quadratic formula',
    use: 'Use this for solving ax² + bx + c = 0 and seeing the solutions as the graph’s zeros.',
    assumptions: [
      'The solutions of ax² + bx + c = 0 are where y = ax² + bx + c meets the x-axis.',
      'x = (−b ± √(b² − 4ac))/(2a); the discriminant b² − 4ac counts them.',
      'Here a > 0 and the discriminant is 0 or more, so x₁ ≤ x₂.',
    ],
    variables: [
      num('a', 'a', 'Leading coefficient', 0.5, 10, 0.5),
      num('b', 'b', 'Linear coefficient'),
      num('c', 'c', 'Constant'),
      { ...out('D', 'D', 'Discriminant'), derived: true },
      { ...out('r1', 'x₁', 'Smaller solution'), derived: true },
      { ...out('r2', 'x₂', 'Larger solution'), derived: true },
    ],
    rules: [
      rule(
        'D = b² − 4ac',
        '{D} = {b}² − 4 × {a} × {c}',
        ['D', 'b', 'a', 'c'],
        (v) => v.D! - (v.b! ** 2 - 4 * v.a! * v.c!),
        {
          D: [
            (v) => v.b! ** 2 - 4 * v.a! * v.c!,
            '{b}² − 4 × {a} × {c}',
            'The discriminant: positive for two zeros, 0 for one.',
          ],
          c: [
            (v) => (v.b! ** 2 - v.D!) / (4 * v.a!),
            '({b}² − {D}) ÷ (4 × {a})',
            'Subtract D from b², then divide by 4a.',
          ],
        },
      ),
      rule(
        'x₁ = (−b − √D)/(2a)',
        '{r1} = (−{b} − √{D})/(2 × {a})',
        ['r1', 'b', 'D', 'a'],
        (v) => v.r1! - (-v.b! - Math.sqrt(v.D!)) / (2 * v.a!),
        {
          r1: [
            (v) => (v.D! < 0 ? undefined : (-v.b! - Math.sqrt(v.D!)) / (2 * v.a!)),
            '(−{b} − √{D}) ÷ (2 × {a})',
            'The quadratic formula with the minus sign.',
          ],
        },
      ),
      rule(
        'x₂ = (−b + √D)/(2a)',
        '{r2} = (−{b} + √{D})/(2 × {a})',
        ['r2', 'b', 'D', 'a'],
        (v) => v.r2! - (-v.b! + Math.sqrt(v.D!)) / (2 * v.a!),
        {
          r2: [
            (v) => (v.D! < 0 ? undefined : (-v.b! + Math.sqrt(v.D!)) / (2 * v.a!)),
            '(−{b} + √{D}) ÷ (2 × {a})',
            'The quadratic formula with the plus sign.',
          ],
        },
      ),
    ],
    example: {
      a: 2,
      b: -1,
      c: -2,
      D: 17,
      r1: (1 - Math.sqrt(17)) / 4,
      r2: (1 + Math.sqrt(17)) / 4,
    },
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'a',
      b: 'b',
      c: 'c',
      shows: { zeros: ['r1', 'r2'] },
      marks: ['zeros', 'vertex'],
    },
  }),

  // ── Quadratic, factored form ──
  page({
    id: 'g.m9-quadratic-formula-factored',
    title: 'Quadratic in factored form',
    use: 'Use this for graphing f(x) = a(x − p)(x − q) from its zeros p and q.',
    assumptions: [
      'f(x) = a(x − p)(x − q) is 0 at x = p and x = q.',
      'The axis of symmetry is halfway between the zeros.',
      'Drag either zero along the x-axis, or the vertex up and down to change a.',
    ],
    variables: [
      num('a', 'a', 'Stretch', -10, 10, 0.5),
      num('p', 'p', 'First zero'),
      num('q', 'q', 'Second zero'),
      { ...out('h', 'h', 'Vertex x'), derived: true },
      { ...out('k', 'k', 'Vertex y'), derived: true },
    ],
    rules: [
      rule('h = (p + q)/2', '{h} = ({p} + {q})/2', ['h', 'p', 'q'], (v) => 2 * v.h! - v.p! - v.q!, {
        h: [
          (v) => (v.p! + v.q!) / 2,
          '({p} + {q}) ÷ 2',
          'The axis of symmetry is halfway between the zeros.',
        ],
        q: [(v) => 2 * v.h! - v.p!, '2 × {h} − {p}', 'Double h, then subtract p.'],
      }),
      rule(
        'k = a(h − p)(h − q)',
        '{k} = {a} × ({h} − {p}) × ({h} − {q})',
        ['k', 'a', 'h', 'p', 'q'],
        (v) => v.k! - v.a! * (v.h! - v.p!) * (v.h! - v.q!),
        {
          k: [
            (v) => v.a! * (v.h! - v.p!) * (v.h! - v.q!),
            '{a} × ({h} − {p}) × ({h} − {q})',
            'Evaluate f at the axis of symmetry.',
          ],
          a: [
            (v) =>
              (v.h! - v.p!) * (v.h! - v.q!) === 0
                ? undefined
                : v.k! / ((v.h! - v.p!) * (v.h! - v.q!)),
            '{k} ÷ (({h} − {p}) × ({h} − {q}))',
            'Divide k by (h − p)(h − q).',
          ],
        },
      ),
    ],
    example: { a: -1, p: -1, q: 3, h: 1, k: 4 },
    startWith: ['a', 'p', 'q'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'factored',
      a: 'a',
      p: 'p',
      q: 'q',
      shows: { vertex: { x: 'h', y: 'k' }, zeros: ['p', 'q'] },
      marks: ['zeros', 'vertex', 'intercept'],
    },
  }),

  // ── Edge of the range: a projectile, h(t) = −4.9t² + vt + s ──
  page({
    id: 'g.m9-quadratic-functions-projectile',
    title: 'Height of a thrown ball',
    use: 'Use this for the height h(t) = −4.9t² + vt + s of a ball thrown straight up.',
    assumptions: [
      'h(t) = −4.9t² + vt + s: height in meters t seconds after the throw.',
      'v is the launch speed in meters per second and s the starting height in meters.',
      'Gravity pulls the ball down at 9.8 m/s², so the leading coefficient is −4.9.',
    ],
    variables: [
      num('v', 'v', 'Launch speed (m/s)', 0, 60, 0.5),
      num('s', 's', 'Starting height (m)', 0, 100, 0.5),
      num('t', 't', 'Time (s)', 0, 20, 0.1),
      out('H', 'h(t)', 'Height (m)'),
    ],
    rules: [
      rule(
        'h(t) = −4.9t² + vt + s',
        '{H} = −4.9 × {t}² + {v}{t} + {s}',
        ['H', 't', 'v', 's'],
        (v) => v.H! - (-4.9 * v.t! ** 2 + v.v! * v.t! + v.s!),
        {
          H: [
            (v) => -4.9 * v.t! ** 2 + v.v! * v.t! + v.s!,
            '−4.9 × {t}² + {v} × {t} + {s}',
            'Put the time into the height formula.',
          ],
          s: [
            (v) => v.H! + 4.9 * v.t! ** 2 - v.v! * v.t!,
            '{H} + 4.9 × {t}² − {v} × {t}',
            'Move the t terms to the other side.',
          ],
          v: [
            (v) => (v.t === 0 ? undefined : (v.H! + 4.9 * v.t! ** 2 - v.s!) / v.t!),
            '({H} + 4.9 × {t}² − {s}) ÷ {t}',
            'Move the other terms across, then divide by t.',
          ],
          t: [
            (v) => {
              const D = v.v! ** 2 + 4 * 4.9 * (v.s! - v.H!);
              return D < 0
                ? undefined
                : [(v.v! - Math.sqrt(D)) / 9.8, (v.v! + Math.sqrt(D)) / 9.8].filter((x) => x >= 0);
            },
            '({v} ± √({v}² + 19.6 × ({s} − {H}))) ÷ 9.8',
            'Write −4.9t² + vt + (s − h) = 0 and use the quadratic formula: once going up, once coming down.',
          ],
        },
      ),
    ],
    example: { v: 15, s: 2, t: 2, H: 12.4 },
    startWith: ['t', 'v', 's'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: -4.9,
      b: 'v',
      c: 's',
      name: 'h',
      at: { x: 't', y: 'H' },
      xMin: 0,
      axes: { x: 'Time t (s)', y: 'Height h (m)' },
      marks: ['vertex', 'zeros'],
    },
  }),

  // ── Exponential growth: f(x) = a · bˣ ──
  page({
    id: 'g.m9-exponential-functions-growth',
    title: 'Exponential growth',
    use: 'Use this for f(x) = a · bˣ with b > 1: the starting value a multiplied by b each step.',
    assumptions: [
      'f(x) = a · bˣ: a is the value at x = 0, b the growth factor.',
      'b > 1 grows; the x-axis y = 0 is an asymptote the curve never reaches.',
      'Drag the starting value, the point at x = 1 (the factor b) or the traced point.',
    ],
    variables: [
      num('a', 'a', 'Starting value', 0.1, 100, 0.1),
      num('b', 'b', 'Growth factor', 0.1, 10, 0.1),
      num('x', 'x', 'Input', -10, 10, 0.1),
      out('y', 'f(x)', 'Output'),
    ],
    rules: [
      rule(
        'f(x) = a · bˣ',
        '{y} = {a} × {b}^{x}',
        ['y', 'a', 'b', 'x'],
        (v) => v.y! - v.a! * v.b! ** v.x!,
        {
          y: [
            (v) => v.a! * v.b! ** v.x!,
            '{a} × {b}^{x}',
            'Multiply the starting value by b, x times.',
          ],
          x: [
            (v) => (v.b === 1 ? undefined : fin(ln(v.y! / v.a!) / ln(v.b!))),
            'ln({y} ÷ {a}) ÷ ln({b})',
            'Divide by a, then take logs: x = ln(y/a) ÷ ln b.',
          ],
          a: [(v) => v.y! / v.b! ** v.x!, '{y} ÷ {b}^{x}', 'Divide both sides by bˣ.'],
          b: [
            (v) => (v.x === 0 ? undefined : pos((v.y! / v.a!) ** (1 / v.x!))),
            '({y} ÷ {a})^(1 ÷ {x})',
            'Divide by a, then take the x-th root.',
          ],
        },
      ),
    ],
    example: { a: 3, b: 2, x: 2, y: 12 },
    startWith: ['x', 'a', 'b'],
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      a: 'a',
      b: 'b',
      at: { x: 'x', y: 'y' },
      marks: ['intercept', 'asymptotes', 'range'],
    },
  }),

  // ── Exponential decay ──
  page({
    id: 'g.m9-exponential-functions-decay',
    title: 'Exponential decay',
    use: 'Use this for f(x) = a · bˣ with 0 < b < 1, such as a half-life (b = 0.5).',
    assumptions: [
      'f(x) = a · bˣ with 0 < b < 1 shrinks by the factor b each step.',
      'With b = 0.5 the value halves each step.',
      'The curve comes down toward y = 0 but never reaches it.',
    ],
    variables: [
      num('a', 'a', 'Starting value', 0.1, 1000, 0.1),
      num('b', 'b', 'Decay factor', 0.05, 0.95, 0.05),
      num('x', 'x', 'Steps', -10, 20, 0.1),
      out('y', 'f(x)', 'Amount left'),
    ],
    rules: [
      rule(
        'f(x) = a · bˣ',
        '{y} = {a} × {b}^{x}',
        ['y', 'a', 'b', 'x'],
        (v) => v.y! - v.a! * v.b! ** v.x!,
        {
          y: [
            (v) => v.a! * v.b! ** v.x!,
            '{a} × {b}^{x}',
            'Multiply the starting value by b, x times.',
          ],
          x: [
            (v) => fin(ln(v.y! / v.a!) / ln(v.b!)),
            'ln({y} ÷ {a}) ÷ ln({b})',
            'Divide by a, then take logs: x = ln(y/a) ÷ ln b.',
          ],
          a: [(v) => v.y! / v.b! ** v.x!, '{y} ÷ {b}^{x}', 'Divide both sides by bˣ.'],
        },
      ),
    ],
    example: { a: 80, b: 0.5, x: 3, y: 10 },
    startWith: ['x', 'a', 'b'],
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      a: 'a',
      b: 'b',
      at: { x: 'x', y: 'y' },
      marks: ['intercept', 'asymptotes'],
    },
  }),

  // ── Continuous growth: A = Pe^(rt) ──
  page({
    id: 'g.m11-exp-log-equations-continuous',
    title: 'Continuous growth',
    use: 'Use this for money growing continuously, A = Pe^(rt), and solving for the time with ln.',
    assumptions: [
      'A = Pe^(rt): P dollars growing continuously at rate r per year for t years.',
      'e ≈ 2.71828 is the base of continuous growth.',
      'The rate is a decimal: 5% is 0.05.',
    ],
    variables: [
      num('P', 'P', 'Principal ($)', 1, 100000, 1),
      num('r', 'r', 'Rate per year', 0.001, 0.5, 0.001),
      num('t', 't', 'Time (years)', 0, 100, 0.5),
      out('A', 'A', 'Amount ($)'),
    ],
    rules: [
      rule(
        'A = Pe^(rt)',
        '{A} = {P} × e^({r}{t})',
        ['A', 'P', 'r', 't'],
        (v) => v.A! - v.P! * Math.exp(v.r! * v.t!),
        {
          A: [
            (v) => v.P! * Math.exp(v.r! * v.t!),
            '{P} × e^({r} × {t})',
            'Multiply the principal by e raised to rt.',
          ],
          t: [
            (v) => fin(ln(v.A! / v.P!) / v.r!),
            'ln({A} ÷ {P}) ÷ {r}',
            'Divide by P, take ln of both sides, then divide by r.',
          ],
          P: [
            (v) => v.A! / Math.exp(v.r! * v.t!),
            '{A} ÷ e^({r} × {t})',
            'Divide both sides by e^(rt).',
          ],
          r: [
            (v) => (v.t === 0 ? undefined : fin(ln(v.A! / v.P!) / v.t!)),
            'ln({A} ÷ {P}) ÷ {t}',
            'Divide by P, take ln of both sides, then divide by t.',
          ],
        },
      ),
    ],
    example: { P: 1000, r: 0.05, t: 10, A: 1000 * Math.exp(0.5) },
    startWith: ['t', 'P', 'r'],
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      a: 'P',
      r: 'r',
      name: 'A',
      at: { x: 't', y: 'A' },
      axes: { x: 'Time t (years)', y: 'Amount A ($)' },
      marks: ['intercept'],
    },
  }),

  // ── Logarithm: f(x) = log_b(x) ──
  page({
    id: 'g.m11-logarithms-log',
    title: 'Logarithmic function',
    use: 'Use this for f(x) = log_b(x): the power of b that gives x.',
    assumptions: [
      'log_b(x) = y means b^y = x.',
      'The domain is x > 0; the y-axis x = 0 is an asymptote.',
      'Every log graph passes through (1, 0) and (b, 1). Drag (b, 1) to change the base.',
    ],
    variables: [
      num('b', 'b', 'Base', 1.1, 10, 0.1),
      num('x', 'x', 'Input', 0.01, 1000, 0.01),
      out('y', 'f(x)', 'Output', 50),
    ],
    rules: [
      rule(
        'f(x) = log_b(x)',
        '{y} = log_{b}({x})',
        ['y', 'b', 'x'],
        (v) => v.y! - ln(v.x!) / ln(v.b!),
        {
          y: [
            (v) => (v.b === 1 ? undefined : fin(ln(v.x!) / ln(v.b!))),
            'ln({x}) ÷ ln({b})',
            'Change of base: log_b(x) = ln x ÷ ln b.',
          ],
          x: [(v) => v.b! ** v.y!, '{b}^{y}', 'Rewrite log_b(x) = y as b^y = x.'],
          b: [
            (v) => (v.y === 0 ? undefined : pos(v.x! ** (1 / v.y!))),
            '{x}^(1 ÷ {y})',
            'Rewrite as b^y = x, then take the y-th root.',
          ],
        },
      ),
    ],
    example: { b: 2, x: 8, y: 3 },
    startWith: ['x', 'b'],
    representation: {
      kind: 'functionGraph',
      family: 'log',
      b: 'b',
      at: { x: 'x', y: 'y' },
      marks: ['zeros', 'asymptotes', 'domain'],
    },
  }),

  // ── Square root: f(x) = a√(x − h) + k ──
  page({
    id: 'g.m11-radical-functions-sqrt',
    title: 'Square root function',
    use: 'Use this for graphing f(x) = a√(x − h) + k with its domain and range.',
    assumptions: [
      'f(x) = a√(x − h) + k starts at (h, k).',
      'The domain is x ≥ h; the range is y ≥ k when a > 0.',
      'Drag the start point, the stretch handle one to the right of it, or the point.',
    ],
    variables: [
      num('a', 'a', 'Stretch', -10, 10, 0.5),
      num('h', 'h', 'Start x'),
      num('k', 'k', 'Start y'),
      num('x', 'x', 'Input'),
      out('y', 'f(x)', 'Output'),
    ],
    rules: [
      rule(
        'f(x) = a√(x − h) + k',
        '{y} = {a} × √({x} − {h}) + {k}',
        ['y', 'a', 'x', 'h', 'k'],
        (v) => v.y! - (v.a! * Math.sqrt(v.x! - v.h!) + v.k!),
        {
          y: [
            (v) => (v.x! < v.h! ? undefined : v.a! * Math.sqrt(v.x! - v.h!) + v.k!),
            '{a} × √({x} − {h}) + {k}',
            'Take the square root of x − h, multiply by a, add k.',
          ],
          x: [
            (v) =>
              v.a === 0 || (v.y! - v.k!) / v.a! < 0
                ? undefined
                : v.h! + ((v.y! - v.k!) / v.a!) ** 2,
            '{h} + (({y} − {k}) ÷ {a})²',
            'Subtract k, divide by a, square both sides, then add h.',
          ],
          k: [
            (v) => (v.x! < v.h! ? undefined : v.y! - v.a! * Math.sqrt(v.x! - v.h!)),
            '{y} − {a} × √({x} − {h})',
            'Subtract a√(x − h) from both sides.',
          ],
        },
      ),
    ],
    example: { a: 2, h: -3, k: -2, x: 1, y: 2 },
    startWith: ['x', 'a', 'h', 'k'],
    representation: {
      kind: 'functionGraph',
      family: 'root',
      index: 2,
      a: 'a',
      h: 'h',
      k: 'k',
      at: { x: 'x', y: 'y' },
      marks: ['vertex', 'zeros', 'domain', 'range'],
    },
  }),

  // ── Cube root ──
  page({
    id: 'g.m11-radical-functions-cube',
    title: 'Cube root function',
    use: 'Use this for graphing f(x) = a∛(x − h) + k, defined for every x.',
    assumptions: [
      'f(x) = a∛(x − h) + k is centered at (h, k).',
      'A cube root takes negatives too, so the domain and range are all real numbers.',
      'Drag the center, the stretch handle or the point.',
    ],
    variables: [
      num('a', 'a', 'Stretch', -10, 10, 0.5),
      num('h', 'h', 'Center x'),
      num('k', 'k', 'Center y'),
      num('x', 'x', 'Input', -100, 100, 0.1),
      out('y', 'f(x)', 'Output'),
    ],
    rules: [
      rule(
        'f(x) = a∛(x − h) + k',
        '{y} = {a} × ∛({x} − {h}) + {k}',
        ['y', 'a', 'x', 'h', 'k'],
        (v) => v.y! - (v.a! * Math.cbrt(v.x! - v.h!) + v.k!),
        {
          y: [
            (v) => v.a! * Math.cbrt(v.x! - v.h!) + v.k!,
            '{a} × ∛({x} − {h}) + {k}',
            'Take the cube root of x − h, multiply by a, add k.',
          ],
          x: [
            (v) => (v.a === 0 ? undefined : v.h! + ((v.y! - v.k!) / v.a!) ** 3),
            '{h} + (({y} − {k}) ÷ {a})³',
            'Subtract k, divide by a, cube both sides, then add h.',
          ],
          k: [
            (v) => v.y! - v.a! * Math.cbrt(v.x! - v.h!),
            '{y} − {a} × ∛({x} − {h})',
            'Subtract a∛(x − h) from both sides.',
          ],
        },
      ),
    ],
    example: { a: 1, h: 2, k: 1, x: 10, y: 3 },
    startWith: ['x', 'a', 'h', 'k'],
    representation: {
      kind: 'functionGraph',
      family: 'root',
      index: 3,
      a: 'a',
      h: 'h',
      k: 'k',
      at: { x: 'x', y: 'y' },
      marks: ['vertex', 'zeros'],
    },
  }),

  // ── Transformations of a parent ──
  page({
    id: 'g.m11-function-transformations-parent',
    title: 'Transforming a parent function',
    use: 'Use this for seeing y = a(x − h)² + k as the parent y = x² stretched and shifted.',
    assumptions: [
      'The parent y = x² is dashed.',
      'h shifts it right, k shifts it up, and a stretches it (a < 0 reflects it in the x-axis).',
      'Drag the vertex to shift and the stretch handle to stretch.',
    ],
    variables: [
      num('a', 'a', 'Stretch', -10, 10, 0.5),
      num('h', 'h', 'Shift right'),
      num('k', 'k', 'Shift up'),
      num('x', 'x', 'Input'),
      out('y', 'g(x)', 'Output'),
    ],
    rules: [
      rule(
        'g(x) = a(x − h)² + k',
        '{y} = {a} × ({x} − {h})² + {k}',
        ['y', 'a', 'x', 'h', 'k'],
        (v) => v.y! - (v.a! * (v.x! - v.h!) ** 2 + v.k!),
        {
          y: [
            (v) => v.a! * (v.x! - v.h!) ** 2 + v.k!,
            '{a} × ({x} − {h})² + {k}',
            'Shift x by h, square, stretch by a, then shift up by k.',
          ],
          k: [
            (v) => v.y! - v.a! * (v.x! - v.h!) ** 2,
            '{y} − {a} × ({x} − {h})²',
            'Subtract a(x − h)² from both sides.',
          ],
          a: [
            (v) => (v.x === v.h ? undefined : (v.y! - v.k!) / (v.x! - v.h!) ** 2),
            '({y} − {k}) ÷ ({x} − {h})²',
            'Subtract k, then divide by (x − h)².',
          ],
        },
      ),
    ],
    example: { a: -1, h: 2, k: 3, x: 4, y: -1 },
    startWith: ['x', 'a', 'h', 'k'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'vertex',
      name: 'g',
      a: 'a',
      h: 'h',
      k: 'k',
      parent: true,
      at: { x: 'x', y: 'y' },
      marks: ['vertex'],
    },
  }),

  // ── Polynomial by its zeros, with multiplicity ──
  page({
    id: 'g.m11-polynomial-functions-zeros',
    title: 'Polynomial from its zeros',
    use: 'Use this for graphing a polynomial from its zeros and multiplicities, and its turning points.',
    assumptions: [
      'f(x) = a(x − z₁)(x − z₂)²(x − z₃) has degree 4.',
      'At a zero of odd multiplicity the graph crosses the x-axis; at z₂, squared, it touches and turns.',
      'Drag each zero along the x-axis.',
    ],
    variables: [
      num('a', 'a', 'Leading coefficient', -5, 5, 0.1),
      num('z1', 'z₁', 'First zero', -10, 10, 0.5),
      num('z2', 'z₂', 'Double zero', -10, 10, 0.5),
      num('z3', 'z₃', 'Third zero', -10, 10, 0.5),
      num('x', 'x', 'Input'),
      out('y', 'f(x)', 'Output'),
    ],
    rules: [
      rule(
        'f(x) = a(x − z₁)(x − z₂)²(x − z₃)',
        '{y} = {a} × ({x} − {z1}) × ({x} − {z2})² × ({x} − {z3})',
        ['y', 'a', 'x', 'z1', 'z2', 'z3'],
        (v) => v.y! - v.a! * (v.x! - v.z1!) * (v.x! - v.z2!) ** 2 * (v.x! - v.z3!),
        {
          y: [
            (v) => v.a! * (v.x! - v.z1!) * (v.x! - v.z2!) ** 2 * (v.x! - v.z3!),
            '{a} × ({x} − {z1}) × ({x} − {z2})² × ({x} − {z3})',
            'Multiply the factors at this x.',
          ],
          a: [
            (v) => {
              const p = (v.x! - v.z1!) * (v.x! - v.z2!) ** 2 * (v.x! - v.z3!);
              return p === 0 ? undefined : v.y! / p;
            },
            '{y} ÷ (({x} − {z1}) × ({x} − {z2})² × ({x} − {z3}))',
            'Divide the output by the product of the factors.',
          ],
        },
      ),
    ],
    example: { a: 0.5, z1: -2, z2: 1, z3: 3, x: 2, y: -2 },
    startWith: ['x', 'a', 'z1', 'z2', 'z3'],
    representation: {
      kind: 'functionGraph',
      family: 'polynomial',
      a: 'a',
      zeros: [{ x: 'z1' }, { x: 'z2', times: 2 }, { x: 'z3' }],
      at: { x: 'x', y: 'y' },
      marks: ['zeros', 'extrema', 'intercept'],
    },
  }),

  // ── Polynomial by its coefficients: the remainder theorem ──
  page({
    id: 'g.m11-polynomial-equations-remainder',
    title: 'Remainder theorem',
    use: 'Use this for the remainder theorem: dividing p(x) by x − c leaves p(c).',
    assumptions: [
      'p(x) = x³ + bx² + cx + d.',
      'Dividing p(x) by x − r leaves the remainder p(r); a remainder of 0 means x − r is a factor.',
      'The zeros are marked exactly where the algebra gives them.',
    ],
    variables: [
      num('b', 'b', 'x² coefficient'),
      num('c', 'c', 'x coefficient'),
      num('d', 'd', 'Constant', -50, 50, 1),
      num('r', 'r', 'Divide by x − r'),
      out('R', 'p(r)', 'Remainder'),
    ],
    rules: [
      rule(
        'p(r) = r³ + br² + cr + d',
        '{R} = {r}³ + {b}{r}² + {c}{r} + {d}',
        ['R', 'r', 'b', 'c', 'd'],
        (v) => v.R! - (v.r! ** 3 + v.b! * v.r! ** 2 + v.c! * v.r! + v.d!),
        {
          R: [
            (v) => v.r! ** 3 + v.b! * v.r! ** 2 + v.c! * v.r! + v.d!,
            '{r}³ + {b} × {r}² + {c} × {r} + {d}',
            'The remainder is p(r): put r into the polynomial.',
          ],
          d: [
            (v) => v.R! - (v.r! ** 3 + v.b! * v.r! ** 2 + v.c! * v.r!),
            '{R} − ({r}³ + {b} × {r}² + {c} × {r})',
            'Subtract the other terms from the remainder.',
          ],
        },
      ),
    ],
    example: { b: -2, c: -5, d: 6, r: 2, R: -4 },
    startWith: ['r', 'b', 'c', 'd'],
    representation: {
      kind: 'functionGraph',
      family: 'polynomial',
      coefficients: [1, 'b', 'c', 'd'],
      name: 'p',
      input: 'x',
      at: { x: 'r', y: 'R' },
      marks: ['zeros', 'intercept'],
    },
  }),
  // ── Rational with a hole: (x − c)(x − z) / ((x − c)(x − p)) ──
  page({
    id: 'g.m11-rational-functions-hole',
    title: 'Rational function with a hole',
    use: 'Use this for a rational function whose top and bottom share a factor: a hole, not an asymptote.',
    assumptions: [
      'f(x) = (x − c)(x − z) ÷ ((x − c)(x − p)): the shared factor x − c cancels.',
      'At x = c there is a hole; at x = p the bottom is 0, so x = p is a vertical asymptote.',
      'The top and bottom have the same degree, so y = 1 is the horizontal asymptote.',
    ],
    variables: [
      num('c', 'c', 'Shared zero', -10, 10, 0.5),
      num('z', 'z', 'Zero', -10, 10, 0.5),
      num('p', 'p', 'Pole', -10, 10, 0.5),
      num('x', 'x', 'Input'),
      out('y', 'f(x)', 'Output', 15),
    ],
    rules: [
      rule(
        'f(x) = (x − z)/(x − p), x ≠ c',
        '{y} = ({x} − {z})/({x} − {p})',
        ['y', 'x', 'z', 'p'],
        (v) => v.y! - (v.x! - v.z!) / (v.x! - v.p!),
        {
          y: [
            (v) => (v.x === v.p ? undefined : (v.x! - v.z!) / (v.x! - v.p!)),
            '({x} − {z}) ÷ ({x} − {p})',
            'Cancel the shared factor x − c, then divide.',
          ],
          x: [
            (v) => (v.y === 1 ? undefined : (v.z! - v.y! * v.p!) / (1 - v.y!)),
            '({z} − {y} × {p}) ÷ (1 − {y})',
            'Multiply by x − p, collect the x terms, then divide by 1 − y.',
          ],
          z: [
            (v) => v.x! - v.y! * (v.x! - v.p!),
            '{x} − {y} × ({x} − {p})',
            'Multiply by x − p, then solve for z.',
          ],
        },
      ),
    ],
    example: { c: 1, z: -2, p: 3, x: 5, y: 3.5 },
    standalone: {
      vars: ['c'],
      why: 'The shared factor cancels: it makes the hole, not the values.',
    },
    startWith: ['x', 'c', 'z', 'p'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      zeros: ['c', 'z'],
      poles: ['c', 'p'],
      at: { x: 'x', y: 'y' },
      marks: ['zeros', 'asymptotes', 'domain'],
    },
  }),

  // ── Rational with a slant asymptote ──
  page({
    id: 'g.m11-rational-functions-slant',
    title: 'Slant asymptote',
    use: 'Use this for a rational function whose top is one degree higher than its bottom.',
    assumptions: [
      'f(x) = (x² − 1) ÷ (x − p): the top has degree 2 and the bottom degree 1.',
      'Dividing gives x + p plus a remainder over x − p, so the graph hugs the line y = x + p.',
      'At x = p the bottom is 0: a vertical asymptote. Drag the zeros ±1 are fixed.',
    ],
    variables: [
      num('p', 'p', 'Pole', -10, 10, 0.5),
      num('x', 'x', 'Input'),
      out('y', 'f(x)', 'Output', 15),
    ],
    rules: [
      rule(
        'f(x) = (x² − 1)/(x − p)',
        '{y} = ({x}² − 1)/({x} − {p})',
        ['y', 'x', 'p'],
        (v) => v.y! - (v.x! ** 2 - 1) / (v.x! - v.p!),
        {
          y: [
            (v) => (v.x === v.p ? undefined : (v.x! ** 2 - 1) / (v.x! - v.p!)),
            '({x}² − 1) ÷ ({x} − {p})',
            'Square x, subtract 1, then divide by x − p.',
          ],
          p: [
            (v) => (v.y === 0 ? undefined : v.x! - (v.x! ** 2 - 1) / v.y!),
            '{x} − ({x}² − 1) ÷ {y}',
            'Multiply by x − p, then solve for p.',
          ],
        },
      ),
    ],
    example: { p: 2, x: 4, y: 7.5 },
    startWith: ['x', 'p'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      zeros: [-1, 1],
      poles: ['p'],
      at: { x: 'x', y: 'y' },
      marks: ['zeros', 'asymptotes', 'extrema'],
    },
  }),

  // ── Rational, shifted reciprocal: a/(x − h) + k ──
  page({
    id: 'g.m11-rational-functions-shift',
    title: 'Shifted reciprocal function',
    use: 'Use this for f(x) = a ÷ (x − h) + k, the parent 1/x moved to the center (h, k).',
    assumptions: [
      'f(x) = a ÷ (x − h) + k has asymptotes x = h and y = k, crossing at the center (h, k).',
      'The domain is every x but h; the range every y but k.',
      'Drag the center to move both asymptotes, or the stretch handle to change a.',
    ],
    variables: [
      num('a', 'a', 'Stretch', -10, 10, 0.5),
      num('h', 'h', 'Center x'),
      num('k', 'k', 'Center y'),
      num('x', 'x', 'Input'),
      out('y', 'f(x)', 'Output', 15),
    ],
    rules: [
      rule(
        'f(x) = a/(x − h) + k',
        '{y} = {a}/({x} − {h}) + {k}',
        ['y', 'a', 'x', 'h', 'k'],
        (v) => v.y! - v.k! - v.a! / (v.x! - v.h!),
        {
          y: [
            (v) => (v.x === v.h ? undefined : v.a! / (v.x! - v.h!) + v.k!),
            '{a} ÷ ({x} − {h}) + {k}',
            'Divide a by x − h, then add k.',
          ],
          x: [
            (v) => (v.y === v.k ? undefined : v.h! + v.a! / (v.y! - v.k!)),
            '{h} + {a} ÷ ({y} − {k})',
            'Subtract k, flip both sides, multiply by a, then add h.',
          ],
          k: [
            (v) => (v.x === v.h ? undefined : v.y! - v.a! / (v.x! - v.h!)),
            '{y} − {a} ÷ ({x} − {h})',
            'Subtract a/(x − h) from both sides.',
          ],
          a: [
            (v) => (v.y! - v.k!) * (v.x! - v.h!),
            '({y} − {k}) × ({x} − {h})',
            'Subtract k, then multiply by x − h.',
          ],
        },
      ),
    ],
    example: { a: 2, h: 1, k: -1, x: 3, y: 0 },
    startWith: ['x', 'a', 'h', 'k'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      a: 'a',
      zeros: [],
      poles: ['h'],
      k: 'k',
      at: { x: 'x', y: 'y' },
      shows: { va: 'h', ha: 'k' },
      marks: ['asymptotes', 'domain', 'range'],
    },
  }),

  // ── Piecewise with a jump ──
  page({
    id: 'g.m9-piecewise-functions-pieces',
    title: 'Piecewise function',
    use: 'Use this for a function with two rules, one each side of a break point.',
    assumptions: [
      'f(x) = x + 3 when x < c, and 2 − x when x ≥ c.',
      'The open dot is an end the piece doesn’t include; the filled dot is f(c).',
      'Drag the point along either piece.',
    ],
    variables: [
      num('c', 'c', 'Break point', -5, 5, 0.5),
      num('x', 'x', 'Input'),
      out('y', 'f(x)', 'Output'),
    ],
    rules: [
      rule(
        'f(x) = x + 3 (x < c), 2 − x (x ≥ c)',
        '{y} = {x} + 3 if {x} < {c}, 2 − {x} if {x} ≥ {c}',
        ['y', 'x', 'c'],
        (v) => v.y! - (v.x! < v.c! ? v.x! + 3 : 2 - v.x!),
        {
          y: [
            (v) => (v.x! < v.c! ? v.x! + 3 : 2 - v.x!),
            (v) => (v.x! < v.c! ? '{x} + 3' : '2 − {x}'),
            (v) =>
              v.x! < v.c!
                ? 'x is left of c: use the first rule, x + 3.'
                : 'x is at c or right of it: use the second rule, 2 − x.',
          ],
          c: [() => undefined, '', ''],
        },
      ),
    ],
    example: { c: 1, x: 3, y: -1 },
    startWith: ['x', 'c'],
    representation: {
      kind: 'functionGraph',
      family: 'piecewise',
      pieces: [
        { f: { family: 'linear', m: 1, b: 3 }, to: 'c', ends: '()' },
        { f: { family: 'linear', m: -1, b: 2 }, from: 'c', ends: '[)' },
      ],
      at: { x: 'x', y: 'y' },
      marks: ['zeros'],
    },
  }),

  // ── Step function: a shipping price ──
  page({
    id: 'g.m9-piecewise-functions-step',
    title: 'Step function',
    use: 'Use this for a price that jumps at each whole unit, such as postage by the pound.',
    assumptions: [
      'Shipping costs $5 for the first pound and $3 for each pound or part of a pound after it.',
      'Each step includes its right end (a filled dot) but not its left end (an open dot).',
      'Packages weigh up to 4 pounds.',
    ],
    variables: [num('w', 'w', 'Weight (lb)', 0.1, 4, 0.1), out('C', 'C', 'Cost ($)', 1000)],
    rules: [
      rule(
        'C = 5 + 3(⌈w⌉ − 1)',
        '{C} = 5 + 3 × (⌈{w}⌉ − 1)',
        ['C', 'w'],
        (v) => v.C! - (5 + 3 * (Math.ceil(v.w! - 1e-9) - 1)),
        {
          C: [
            (v) => 5 + 3 * (Math.ceil(v.w! - 1e-9) - 1),
            (v) => `5 + 3 × ${Math.ceil(v.w! - 1e-9) - 1}`,
            'Each pound or part of a pound after the first adds $3.',
          ],
          w: [() => undefined, '', ''],
        },
      ),
    ],
    example: { w: 2.5, C: 11 },
    startWith: ['w'],
    representation: {
      kind: 'functionGraph',
      family: 'piecewise',
      name: 'C',
      pieces: [
        { f: { family: 'linear', m: 0, b: 5 }, from: 0, to: 1, ends: '(]' },
        { f: { family: 'linear', m: 0, b: 8 }, from: 1, to: 2, ends: '(]' },
        { f: { family: 'linear', m: 0, b: 11 }, from: 2, to: 3, ends: '(]' },
        { f: { family: 'linear', m: 0, b: 14 }, from: 3, to: 4, ends: '(]' },
      ],
      at: { x: 'w', y: 'C' },
      axes: { x: 'Weight w (lb)', y: 'Cost C ($)' },
      window: { x: [0, 5], y: [0, 16] },
      marks: ['domain'],
    },
  }),

  // ── Logistic growth: a population with a carrying capacity ──
  page({
    id: 'g.s9-population-ecology-logistic',
    title: 'Logistic growth',
    use: 'Use this for a population that grows fast at first, then levels off at the carrying capacity K.',
    assumptions: [
      'N(t) = K ÷ (1 + Ae^(−rt)) with A = (K − N₀) ÷ N₀, so N(0) = N₀.',
      'K is the carrying capacity: the most the habitat can support.',
      'Growth is fastest at half of K; the dashed lines N = 0 and N = K are asymptotes.',
    ],
    variables: [
      num('K', 'K', 'Carrying capacity', 10, 100000, 10),
      num('N0', 'N₀', 'Starting population', 1, 100000, 1),
      num('r', 'r', 'Growth rate', 0.01, 3, 0.01),
      num('t', 't', 'Time (years)', 0, 200, 0.5),
      out('N', 'N', 'Population'),
    ],
    rules: [
      rule(
        'N = K/(1 + ((K − N₀)/N₀)e^(−rt))',
        '{N} = {K} ÷ (1 + (({K} − {N0}) ÷ {N0}) × e^(−{r}{t}))',
        ['N', 'K', 'N0', 'r', 't'],
        (v) => v.N! - v.K! / (1 + ((v.K! - v.N0!) / v.N0!) * Math.exp(-v.r! * v.t!)),
        {
          N: [
            (v) => v.K! / (1 + ((v.K! - v.N0!) / v.N0!) * Math.exp(-v.r! * v.t!)),
            '{K} ÷ (1 + (({K} − {N0}) ÷ {N0}) × e^(−{r} × {t}))',
            'Work out A = (K − N₀)/N₀, then K ÷ (1 + Ae^(−rt)).',
          ],
          t: [
            (v) => {
              const q = (((v.K! - v.N0!) / v.N0!) * v.N!) / (v.K! - v.N!);
              return q > 0 ? fin(ln(q) / v.r!) : undefined;
            },
            'ln((({K} − {N0}) ÷ {N0}) × {N} ÷ ({K} − {N})) ÷ {r}',
            'Solve 1 + Ae^(−rt) = K/N for e^(−rt), then take ln and divide by −r.',
          ],
          K: [() => undefined, '', ''],
          N0: [() => undefined, '', ''],
          r: [() => undefined, '', ''],
        },
      ),
    ],
    example: { K: 500, N0: 20, r: 0.3, t: 10, N: 500 / (1 + 24 * Math.exp(-3)) },
    startWith: ['t', 'K', 'N0', 'r'],
    representation: {
      kind: 'functionGraph',
      family: 'logistic',
      K: 'K',
      start: 'N0',
      r: 'r',
      name: 'N',
      at: { x: 't', y: 'N' },
      axes: { x: 'Time t (years)', y: 'Population N' },
      marks: ['asymptotes', 'extrema'],
    },
  }),

  // ── Sine: amplitude, period and midline ──
  page({
    id: 'g.m11-trig-graphs-sine',
    title: 'Graph of sine',
    use: 'Use this for y = a sin(bx) + k: the amplitude |a|, the period 2π/b and the midline y = k.',
    assumptions: [
      'y = a sin(bx) + k with x in radians.',
      'The amplitude is |a|, the period 2π ÷ b and the midline y = k.',
      'Drag the peak across to change b and up to change a; drag the start to move the midline.',
    ],
    variables: [
      num('a', 'a', 'Amplitude factor', -10, 10, 0.5),
      num('b', 'b', 'Frequency', 0.25, 8, 0.25),
      num('k', 'k', 'Midline', -10, 10, 0.5),
      num('x', 'x', 'Angle (radians)', -20, 20, 0.01),
      out('y', 'y', 'Output'),
      { ...out('P', 'P', 'Period'), derived: true },
    ],
    rules: [
      rule(
        'y = a sin(bx) + k',
        '{y} = {a} × sin({b}{x}) + {k}',
        ['y', 'a', 'b', 'x', 'k'],
        (v) => v.y! - (v.a! * Math.sin(v.b! * v.x!) + v.k!),
        {
          y: [
            (v) => v.a! * Math.sin(v.b! * v.x!) + v.k!,
            '{a} × sin({b} × {x}) + {k}',
            'Multiply the angle by b, take the sine, stretch by a and add k.',
          ],
          k: [
            (v) => v.y! - v.a! * Math.sin(v.b! * v.x!),
            '{y} − {a} × sin({b} × {x})',
            'Subtract a sin(bx) from both sides.',
          ],
          a: [
            (v) =>
              Math.abs(Math.sin(v.b! * v.x!)) < 1e-9
                ? undefined
                : (v.y! - v.k!) / Math.sin(v.b! * v.x!),
            '({y} − {k}) ÷ sin({b} × {x})',
            'Subtract k, then divide by sin(bx).',
          ],
        },
      ),
      rule('P = 2π/b', '{P} = 2π/{b}', ['P', 'b'], (v) => v.P! * v.b! - 2 * Math.PI, {
        P: [
          (v) => (2 * Math.PI) / v.b!,
          '2π ÷ {b}',
          'One full turn, 2π, divided by the frequency b.',
        ],
        b: [(v) => (2 * Math.PI) / v.P!, '2π ÷ {P}', 'Multiply by b and divide by P.'],
      }),
    ],
    example: {
      a: 2,
      b: 2,
      k: 1,
      x: Math.round((Math.PI / 4) * 1e4) / 1e4,
      y: 2 * Math.sin((Math.round((Math.PI / 4) * 1e4) / 1e4) * 2) + 1,
      P: Math.PI,
    },
    startWith: ['x', 'a', 'b', 'k'],
    representation: {
      kind: 'functionGraph',
      family: 'sin',
      a: 'a',
      b: 'b',
      k: 'k',
      at: { x: 'x', y: 'y' },
      shows: { period: 'P' },
      marks: ['midline', 'amplitude', 'period'],
    },
  }),

  // ── Cosine, shifted by π/3 ──
  page({
    id: 'g.m11-trig-graphs-cosine',
    title: 'Graph of cosine',
    use: 'Use this for y = a cos(x − π/3) + k, a cosine shifted π/3 to the right.',
    assumptions: [
      'y = a cos(x − π/3) + k with x in radians: the peak moves from x = 0 to x = π/3.',
      'The period is 2π; the maximum is k + |a| and the minimum k − |a|.',
      'Drag the peak to move the midline; drag the low point to change a.',
    ],
    variables: [
      num('a', 'a', 'Amplitude factor', -10, 10, 0.5),
      num('k', 'k', 'Midline', -10, 10, 0.5),
      num('x', 'x', 'Angle (radians)', -20, 20, 0.01),
      out('y', 'y', 'Output'),
    ],
    rules: [
      rule(
        'y = a cos(x − π/3) + k',
        '{y} = {a} × cos({x} − π/3) + {k}',
        ['y', 'a', 'x', 'k'],
        (v) => v.y! - (v.a! * Math.cos(v.x! - Math.PI / 3) + v.k!),
        {
          y: [
            (v) => v.a! * Math.cos(v.x! - Math.PI / 3) + v.k!,
            '{a} × cos({x} − π ÷ 3) + {k}',
            'Shift the angle back by π/3, take the cosine, stretch by a, add k.',
          ],
          k: [
            (v) => v.y! - v.a! * Math.cos(v.x! - Math.PI / 3),
            '{y} − {a} × cos({x} − π ÷ 3)',
            'Subtract a cos(x − π/3) from both sides.',
          ],
          a: [
            (v) =>
              Math.abs(Math.cos(v.x! - Math.PI / 3)) < 1e-9
                ? undefined
                : (v.y! - v.k!) / Math.cos(v.x! - Math.PI / 3),
            '({y} − {k}) ÷ cos({x} − π ÷ 3)',
            'Subtract k, then divide by cos(x − π/3).',
          ],
        },
      ),
    ],
    example: { a: 3, k: 0, x: 2, y: 3 * Math.cos(2 - Math.PI / 3) },
    startWith: ['x', 'a', 'k'],
    representation: {
      kind: 'functionGraph',
      family: 'cos',
      a: 'a',
      h: Math.PI / 3,
      k: 'k',
      at: { x: 'x', y: 'y' },
      marks: ['extrema', 'zeros', 'period'],
    },
  }),

  // ── Tangent: asymptotes every period ──
  page({
    id: 'g.m11-trig-graphs-tangent',
    title: 'Graph of tangent',
    use: 'Use this for y = a tan(bx): period π/b, with a vertical asymptote wherever cos(bx) = 0.',
    assumptions: [
      'y = a tan(bx), x in radians.',
      'tan(bx) = sin(bx) ÷ cos(bx) has no value where cos(bx) = 0: dashed asymptotes.',
      'The period is π ÷ b.',
    ],
    variables: [
      num('a', 'a', 'Stretch', -10, 10, 0.5),
      num('b', 'b', 'Frequency', 0.25, 4, 0.25),
      num('x', 'x', 'Angle (radians)', -20, 20, 0.01),
      out('y', 'y', 'Output', 15),
      { ...out('P', 'P', 'Period'), derived: true },
    ],
    rules: [
      rule(
        'y = a tan(bx)',
        '{y} = {a} × tan({b}{x})',
        ['y', 'a', 'b', 'x'],
        (v) => v.y! - v.a! * Math.tan(v.b! * v.x!),
        {
          y: [
            (v) =>
              Math.abs(Math.cos(v.b! * v.x!)) < 1e-9 ? undefined : v.a! * Math.tan(v.b! * v.x!),
            '{a} × tan({b} × {x})',
            'Multiply the angle by b, take the tangent, then stretch by a.',
          ],
          a: [
            (v) =>
              Math.abs(Math.tan(v.b! * v.x!)) < 1e-9 ? undefined : v.y! / Math.tan(v.b! * v.x!),
            '{y} ÷ tan({b} × {x})',
            'Divide by tan(bx).',
          ],
        },
      ),
      rule('P = π/b', '{P} = π/{b}', ['P', 'b'], (v) => v.P! * v.b! - Math.PI, {
        P: [
          (v) => Math.PI / v.b!,
          'π ÷ {b}',
          'Tangent repeats every π; divide by the frequency b.',
        ],
        b: [(v) => Math.PI / v.P!, 'π ÷ {P}', 'Multiply by b and divide by P.'],
      }),
    ],
    example: { a: 1, b: 0.5, x: 1, y: Math.tan(0.5), P: 2 * Math.PI },
    startWith: ['x', 'a', 'b'],
    representation: {
      kind: 'functionGraph',
      family: 'tan',
      a: 'a',
      b: 'b',
      at: { x: 'x', y: 'y' },
      shows: { period: 'P' },
      marks: ['asymptotes', 'zeros', 'period'],
    },
  }),

  // ── Inverse sine on its restricted domain ──
  page({
    id: 'g.m12-inverse-trig-arcsin',
    title: 'Inverse sine',
    use: 'Use this for y = sin⁻¹(x): the angle from −π/2 to π/2 whose sine is x.',
    assumptions: [
      'sin⁻¹(x) is the angle in [−π/2, π/2] whose sine is x.',
      'The domain is −1 ≤ x ≤ 1 and the range −π/2 ≤ y ≤ π/2.',
      'Drag the point along the curve.',
    ],
    variables: [num('x', 'x', 'Sine value', -1, 1, 0.05), out('y', 'y', 'Angle (radians)', 2)],
    rules: [
      rule('y = sin⁻¹(x)', '{y} = sin⁻¹({x})', ['y', 'x'], (v) => v.y! - Math.asin(v.x!), {
        y: [
          (v) => Math.asin(v.x!),
          'sin⁻¹({x})',
          'The angle between −π/2 and π/2 whose sine is x.',
        ],
        x: [
          (v) => (Math.abs(v.y!) > Math.PI / 2 ? undefined : Math.sin(v.y!)),
          'sin({y})',
          'Take the sine of both sides.',
        ],
      }),
    ],
    example: { x: 0.5, y: Math.PI / 6 },
    startWith: ['x'],
    representation: {
      kind: 'functionGraph',
      family: 'arcsin',
      at: { x: 'x', y: 'y' },
      marks: ['domain', 'range'],
    },
  }),

  // ── Inverse tangent: two horizontal asymptotes ──
  page({
    id: 'g.m12-inverse-trig-arctan',
    title: 'Inverse tangent',
    use: 'Use this for y = tan⁻¹(x): defined for every x, between the asymptotes y = ±π/2.',
    assumptions: [
      'tan⁻¹(x) is the angle in (−π/2, π/2) whose tangent is x.',
      'Every x has one, so the domain is all real numbers.',
      'The range is −π/2 < y < π/2: the curve nears y = ±π/2 but never reaches them.',
    ],
    variables: [
      num('x', 'x', 'Tangent value', -100, 100, 0.1),
      out('y', 'y', 'Angle (radians)', 2),
    ],
    rules: [
      rule('y = tan⁻¹(x)', '{y} = tan⁻¹({x})', ['y', 'x'], (v) => v.y! - Math.atan(v.x!), {
        y: [
          (v) => Math.atan(v.x!),
          'tan⁻¹({x})',
          'The angle between −π/2 and π/2 whose tangent is x.',
        ],
        x: [
          (v) => (Math.abs(v.y!) >= Math.PI / 2 ? undefined : Math.tan(v.y!)),
          'tan({y})',
          'Take the tangent of both sides.',
        ],
      }),
    ],
    example: { x: 1, y: Math.PI / 4 },
    startWith: ['x'],
    representation: {
      kind: 'functionGraph',
      family: 'arctan',
      at: { x: 'x', y: 'y' },
      marks: ['asymptotes', 'range'],
    },
  }),

  // ── An exponential and its inverse, the log ──
  page({
    id: 'g.m11-inverse-functions-exp-log',
    title: 'A function and its inverse',
    use: 'Use this for seeing f(x) = bˣ and its inverse log_b(x) as reflections across y = x.',
    assumptions: [
      'f(x) = bˣ and f⁻¹(x) = log_b(x) undo each other.',
      'Each point (x, y) on f is (y, x) on f⁻¹: the graphs are mirror images across y = x.',
      'Drag the point along f.',
    ],
    variables: [
      num('b', 'b', 'Base', 1.1, 5, 0.1),
      num('x', 'x', 'Input', -5, 5, 0.1),
      out('y', 'f(x)', 'Output', 10000),
    ],
    rules: [
      rule('f(x) = bˣ', '{y} = {b}^{x}', ['y', 'b', 'x'], (v) => v.y! - v.b! ** v.x!, {
        y: [(v) => v.b! ** v.x!, '{b}^{x}', 'Multiply b by itself x times.'],
        x: [
          (v) => fin(ln(v.y!) / ln(v.b!)),
          'ln({y}) ÷ ln({b})',
          'The inverse: x = log_b(y) = ln y ÷ ln b.',
        ],
      }),
    ],
    example: { b: 2, x: 1.5, y: 2 ** 1.5 },
    startWith: ['x', 'b'],
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      b: 'b',
      at: { x: 'x', y: 'y' },
      inverse: true,
      marks: ['intercept'],
    },
  }),

  // ── Solving bˣ = c where two graphs cross ──
  page({
    id: 'g.m11-exp-log-equations-crossing',
    title: 'Solving an exponential equation on a graph',
    use: 'Use this for solving bˣ = c: the x where y = bˣ meets the line y = c.',
    assumptions: [
      'The solution of bˣ = c is where f(x) = bˣ and g(x) = c cross.',
      'Taking logs gives it exactly: x = ln c ÷ ln b.',
      'c must be positive: bˣ never reaches 0 or below.',
    ],
    variables: [
      num('b', 'b', 'Base', 1.1, 10, 0.1),
      num('c', 'c', 'Target', 0.1, 1000, 0.1),
      out('x', 'x', 'Solution', 1000),
    ],
    rules: [
      rule('bˣ = c', '{b}^{x} = {c}', ['b', 'x', 'c'], (v) => v.b! ** v.x! - v.c!, {
        x: [
          (v) => fin(ln(v.c!) / ln(v.b!)),
          'ln({c}) ÷ ln({b})',
          'Take ln of both sides: x ln b = ln c, then divide by ln b.',
        ],
        c: [(v) => v.b! ** v.x!, '{b}^{x}', 'Raise b to the power x.'],
      }),
    ],
    example: { b: 2, c: 5, x: ln(5) / ln(2) },
    startWith: ['b', 'c'],
    representation: {
      kind: 'functionGraph',
      family: 'exponential',
      b: 'b',
      other: { family: 'linear', m: 0, b: 'c' },
      crossing: { x: 'x' },
    },
  }),

  // ── Shading between the zeros: a quadratic inequality ──
  page({
    id: 'g.m9-quadratic-formula-inequality',
    title: 'Quadratic inequality',
    use: 'Use this for solving ax² + bx + c ≤ 0 (a > 0): the x between the zeros, where the graph is on or below the axis.',
    assumptions: [
      'With a > 0 the parabola opens up, so it is on or below the x-axis between its zeros.',
      'The solution is x₁ ≤ x ≤ x₂, shaded.',
      'The zeros come from the quadratic formula; b² − 4ac must be 0 or more.',
    ],
    variables: [
      num('a', 'a', 'Leading coefficient', 0.5, 10, 0.5),
      num('b', 'b', 'Linear coefficient'),
      num('c', 'c', 'Constant'),
      { ...out('r1', 'x₁', 'Smaller zero'), derived: true },
      { ...out('r2', 'x₂', 'Larger zero'), derived: true },
    ],
    rules: [
      rule(
        'x₁ = (−b − √(b² − 4ac))/(2a)',
        '{r1} = (−{b} − √({b}² − 4 × {a} × {c}))/(2 × {a})',
        ['r1', 'a', 'b', 'c'],
        (v) => v.r1! - (-v.b! - Math.sqrt(v.b! ** 2 - 4 * v.a! * v.c!)) / (2 * v.a!),
        {
          r1: [
            (v) =>
              v.b! ** 2 < 4 * v.a! * v.c!
                ? undefined
                : (-v.b! - Math.sqrt(v.b! ** 2 - 4 * v.a! * v.c!)) / (2 * v.a!),
            '(−{b} − √({b}² − 4 × {a} × {c})) ÷ (2 × {a})',
            'The quadratic formula with the minus sign.',
          ],
        },
      ),
      rule(
        'x₂ = (−b + √(b² − 4ac))/(2a)',
        '{r2} = (−{b} + √({b}² − 4 × {a} × {c}))/(2 × {a})',
        ['r2', 'a', 'b', 'c'],
        (v) => v.r2! - (-v.b! + Math.sqrt(v.b! ** 2 - 4 * v.a! * v.c!)) / (2 * v.a!),
        {
          r2: [
            (v) =>
              v.b! ** 2 < 4 * v.a! * v.c!
                ? undefined
                : (-v.b! + Math.sqrt(v.b! ** 2 - 4 * v.a! * v.c!)) / (2 * v.a!),
            '(−{b} + √({b}² − 4 × {a} × {c})) ÷ (2 × {a})',
            'The quadratic formula with the plus sign.',
          ],
        },
      ),
    ],
    example: { a: 1, b: -1, c: -6, r1: -2, r2: 3 },
    startWith: ['a', 'b', 'c'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'standard',
      a: 'a',
      b: 'b',
      c: 'c',
      shade: { from: 'r1', to: 'r2' },
      shows: { zeros: ['r1', 'r2'] },
      marks: ['zeros'],
    },
  }),

  // ── A limit at a hole ──
  page({
    id: 'g.m12-limits-intro-hole',
    title: 'Limit at a hole',
    use: 'Use this for a limit where the function has no value but both sides head to the same value.',
    assumptions: [
      'f(x) = (x − c)(x − d) ÷ (x − c) has no value at x = c.',
      'Everywhere else it equals x − d, so from both sides f(x) heads to c − d.',
      'The limit is c − d even though f(c) doesn’t exist.',
    ],
    variables: [
      num('c', 'c', 'Hole at', -5, 5, 0.5),
      num('d', 'd', 'Zero', -5, 5, 0.5),
      out('L', 'L', 'Limit'),
    ],
    pictureLabels: ['L'],
    rules: [
      rule('L = c − d', '{L} = {c} − {d}', ['L', 'c', 'd'], (v) => v.L! - (v.c! - v.d!), {
        L: [(v) => v.c! - v.d!, '{c} − {d}', 'Cancel x − c; the rest, x − d, at x = c is c − d.'],
        c: [(v) => v.L! + v.d!, '{L} + {d}', 'Add d to both sides.'],
        d: [(v) => v.c! - v.L!, '{c} − {L}', 'Subtract L from c.'],
      }),
    ],
    example: { c: 2, d: -1, L: 3 },
    startWith: ['c', 'd'],
    representation: {
      kind: 'functionGraph',
      family: 'rational',
      zeros: ['c', 'd'],
      poles: ['c'],
      limit: { x: 'c' },
    },
  }),

  // ── A jump: the one-sided limits differ ──
  page({
    id: 'g.m12-limits-intro-jump',
    title: 'One-sided limits at a jump',
    use: 'Use this for a piecewise function whose pieces meet at different heights: the limit does not exist.',
    assumptions: [
      'f(x) = x² when x < c, and x + 1 when x ≥ c.',
      'From the left f(x) heads to c²; from the right to c + 1.',
      'When the two differ the limit does not exist; when they agree it does.',
    ],
    variables: [
      num('c', 'c', 'Break point', -3, 3, 0.25),
      { ...out('Lm', 'L⁻', 'Left limit'), derived: true },
      { ...out('Lp', 'L⁺', 'Right limit'), derived: true },
    ],
    pictureLabels: ['Lm', 'Lp'],
    rules: [
      rule('L⁻ = c²', '{Lm} = {c}²', ['Lm', 'c'], (v) => v.Lm! - v.c! ** 2, {
        Lm: [(v) => v.c! ** 2, '{c}²', 'Left of c the rule is x²: put in x = c.'],
      }),
      rule('L⁺ = c + 1', '{Lp} = {c} + 1', ['Lp', 'c'], (v) => v.Lp! - (v.c! + 1), {
        Lp: [(v) => v.c! + 1, '{c} + 1', 'At c and right of it the rule is x + 1: put in x = c.'],
        c: [(v) => v.Lp! - 1, '{Lp} − 1', 'Subtract 1.'],
      }),
    ],
    example: { c: 1, Lm: 1, Lp: 2 },
    startWith: ['c'],
    representation: {
      kind: 'functionGraph',
      family: 'piecewise',
      pieces: [
        { f: { family: 'quadratic', form: 'vertex', h: 0, k: 0 }, to: 'c', ends: '()' },
        { f: { family: 'linear', m: 1, b: 1 }, from: 'c', ends: '[)' },
      ],
      limit: { x: 'c' },
    },
  }),

  // ── A secant turning into the tangent ──
  page({
    id: 'g.m12-limits-intro-secant',
    title: 'From secant to tangent',
    use: 'Use this for the slope of a secant (f(x + h) − f(x)) ÷ h and the tangent it approaches as h → 0.',
    assumptions: [
      'f(x) = x²; the secant joins P = (x, f(x)) to Q = (x + h, f(x + h)).',
      'Its slope is (f(x + h) − f(x)) ÷ h, which for x² is 2x + h.',
      'Drag Q toward P: as h → 0 the secant turns into the tangent (dashed), slope 2x.',
    ],
    variables: [
      num('x0', 'x', 'Point P at', -5, 5, 0.5),
      num('h', 'h', 'Step to Q', -5, 5, 0.1),
      out('m', 'm', 'Secant slope'),
    ],
    rules: [
      rule(
        'm = ((x + h)² − x²)/h',
        '{m} = (({x0} + {h})² − {x0}²) ÷ {h}',
        ['m', 'x0', 'h'],
        (v) => v.m! * v.h! - ((v.x0! + v.h!) ** 2 - v.x0! ** 2),
        {
          m: [
            (v) => (v.h === 0 ? undefined : ((v.x0! + v.h!) ** 2 - v.x0! ** 2) / v.h!),
            '(({x0} + {h})² − {x0}²) ÷ {h}',
            'Rise from P to Q over the run h.',
          ],
          h: [
            (v) => v.m! - 2 * v.x0!,
            '{m} − 2 × {x0}',
            'The slope simplifies to 2x + h, so h = m − 2x.',
          ],
          x0: [
            (v) => (v.m! - v.h!) / 2,
            '({m} − {h}) ÷ 2',
            'The slope simplifies to 2x + h: subtract h, then halve.',
          ],
        },
      ),
    ],
    example: { x0: 1, h: 1.5, m: 3.5 },
    startWith: ['x0', 'h'],
    representation: {
      kind: 'functionGraph',
      family: 'quadratic',
      form: 'vertex',
      h: 0,
      k: 0,
      secant: { x: 'x0', h: 'h', slope: 'm' },
    },
  }),
];
export const HSA_GALLERY_LAYOUTS: LayoutDef[] = [];
