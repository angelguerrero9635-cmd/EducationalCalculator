/**
 * Grades 9–12 gallery demos (group HE; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 *
 * H16 `lineSystem` / `linearFunction` shading and elimination's sum line.
 */
import { quartile } from '@/components/module/reps/stats';
import type { Values } from '@/engine/types';
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';
import type { InequalitySign } from './typesGraphs';

type Solver = (v: Values) => number | number[] | undefined;

/** A value typed or dragged: `min` to `max` in steps of `step`. */
const num = (id: string, symbol: string, name: string, min = -20, max = 20, step = 0.5) => ({
  id,
  symbol,
  name,
  min,
  max,
  step,
});
/** A value the rules work out (wide range, no drag step). */
const out = (id: string, symbol: string, name: string, lim = 1e9) => ({
  id,
  symbol,
  name,
  min: -lim,
  max: lim,
  derived: true,
});
/** A solver that can't be run this way round (the rule is only solved for its other values). */
const none: [Solver, string, string] = [() => undefined, '', ''];

/**
 * A relation with its steps: for each variable it is solved for, the solver, the rearranged
 * right side and the explanation.
 */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how']] | [Solver, StepText]>,
  /** The check line as plain arithmetic, for a rule whose display is not a number sentence. */
  check?: (v: Values) => string,
) {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const v of vars) {
    const part = parts[v] ?? none;
    const fn = part[0];
    solve[v] = fn;
    if (fn.length > 0) steps[v] = part.length === 2 ? part[1] : { expr: part[1], how: part[2] };
  }
  return { relation: { id, display, vars, residual, solve, ...(check ? { check } : {}) }, steps };
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

/** A quotient, or nothing when the divisor is 0. */
const div = (a: number, b: number) => (b === 0 ? undefined : a / b);

// ── H16: systems of inequalities ──

/** Where the two boundaries cross: the region's corner. */
const cornerRules = [
  rule(
    'x = (b₂ − b₁) ÷ (m₁ − m₂)',
    '{x} = ({b2} − {b1}) ÷ ({m1} − {m2})',
    ['x', 'b2', 'b1', 'm1', 'm2'],
    (v) => v.x! * (v.m1! - v.m2!) - (v.b2! - v.b1!),
    {
      x: [
        (v) => div(v.b2! - v.b1!, v.m1! - v.m2!),
        '({b2} − {b1}) ÷ ({m1} − {m2})',
        'Set the two boundaries equal, gather x on one side, then divide.',
      ],
    },
  ),
  rule(
    'y = m₁x + b₁',
    '{y} = {m1} × {x} + {b1}',
    ['y', 'm1', 'x', 'b1'],
    (v) => v.y! - (v.m1! * v.x! + v.b1!),
    { y: [(v) => v.m1! * v.x! + v.b1!, '{m1} × {x} + {b1}', 'Put x into the first line.'] },
  ),
];

/**
 * y (s₁) m₁x + b₁ and y (s₂) m₂x + b₂: the two half-planes and their overlap, the corner
 * where the boundaries cross, and a test point (its height above each boundary).
 */
function inequalitySystem(
  id: string,
  title: string,
  signs: [InequalitySign, InequalitySign],
  example: Values,
  /** The corner where the boundaries cross (parallel boundaries have none). */
  corner = true,
): ModuleDef {
  return page({
    id,
    title,
    use: 'Use this for graphing a system of two linear inequalities and testing a point in both.',
    assumptions: [
      'Each inequality is shaded on its side of its boundary line.',
      'A dashed line (< or >) is left out; a solid line (≤ or ≥) is included.',
      'The solutions are where both sides are shaded. Drag the intercepts and slopes.',
    ],
    variables: [
      num('m1', 'm₁', 'First slope', -10, 10),
      num('b1', 'b₁', 'First intercept'),
      num('m2', 'm₂', 'Second slope', -10, 10),
      num('b2', 'b₂', 'Second intercept'),
      ...(corner ? [out('x', 'x', 'Corner x'), out('y', 'y', 'Corner y')] : []),
      num('tx', 'x₀', 'Test point x'),
      num('ty', 'y₀', 'Test point y'),
      out('d1', 'd₁', 'Test point above the first line'),
      out('d2', 'd₂', 'Test point above the second line'),
    ],
    rules: [
      ...(corner ? cornerRules : []),
      rule(
        'd₁ = y₀ − (m₁x₀ + b₁)',
        '{d1} = {ty} − ({m1} × {tx} + {b1})',
        ['d1', 'ty', 'm1', 'tx', 'b1'],
        (v) => v.d1! - (v.ty! - (v.m1! * v.tx! + v.b1!)),
        {
          d1: [
            (v) => v.ty! - (v.m1! * v.tx! + v.b1!),
            '{ty} − ({m1} × {tx} + {b1})',
            'The first line’s height at x₀, taken from y₀: above the line is positive.',
          ],
          ty: [
            (v) => v.d1! + v.m1! * v.tx! + v.b1!,
            '{d1} + {m1} × {tx} + {b1}',
            'Add the line’s height at x₀ to both sides.',
          ],
        },
      ),
      rule(
        'd₂ = y₀ − (m₂x₀ + b₂)',
        '{d2} = {ty} − ({m2} × {tx} + {b2})',
        ['d2', 'ty', 'm2', 'tx', 'b2'],
        (v) => v.d2! - (v.ty! - (v.m2! * v.tx! + v.b2!)),
        {
          d2: [
            (v) => v.ty! - (v.m2! * v.tx! + v.b2!),
            '{ty} − ({m2} × {tx} + {b2})',
            'The second line’s height at x₀, taken from y₀: above the line is positive.',
          ],
        },
      ),
    ],
    example,
    startWith: ['m1', 'b1', 'm2', 'b2', 'tx', 'ty'],
    representation: {
      kind: 'lineSystem',
      lines: [
        { slope: 'm1', intercept: 'b1', shade: signs[0] },
        { slope: 'm2', intercept: 'b2', shade: signs[1] },
      ],
      ...(corner ? { solution: { x: 'x', y: 'y' } } : {}),
      test: { x: 'tx', y: 'ty' },
      extent: 10,
    },
  });
}

const H16_MODULES: ModuleDef[] = [
  inequalitySystem('g.m9-inequality-systems-shade', 'System of linear inequalities', ['>', '≤'], {
    m1: 1,
    b1: -2,
    m2: -0.5,
    b2: 4,
    x: 4,
    y: 2,
    tx: 1,
    ty: 1,
    d1: 2,
    d2: -2.5,
  }),
  // The edge: parallel boundaries shaded away from each other never meet.
  inequalitySystem(
    'g.m9-inequality-systems-parallel',
    'Inequalities with no solution',
    ['>', '<'],
    { m1: 2, b1: 3, m2: 2, b2: -1, tx: 0, ty: 1, d1: -2, d2: 2 },
    false,
  ),

  // One inequality in standard form: Ax + By < C is y < (−A ÷ B)x + C ÷ B when B > 0.
  page({
    id: 'g.m9-linear-inequalities-half-plane',
    title: 'Graphing a linear inequality',
    use: 'Use this for graphing Ax + By < C: solve for y, draw the boundary dashed, shade below.',
    assumptions: [
      'Ax + By < C with B > 0 is y < (−A ÷ B)x + C ÷ B: shade below the line.',
      'The boundary is dashed: points on it make Ax + By = C, not less.',
      'Drag the intercept or the slope handle.',
    ],
    variables: [
      num('A', 'A', 'x-coefficient', -20, 20, 1),
      num('B', 'B', 'y-coefficient', 1, 20, 1),
      num('C', 'C', 'Right side', -40, 40, 1),
      { ...num('m', 'm', 'Slope', -20, 20, 0.5), derived: true },
      { ...num('b', 'b', 'Intercept', -40, 40, 0.5), derived: true },
    ],
    rules: [
      rule('m = −A ÷ B', '{m} = −{A} ÷ {B}', ['m', 'A', 'B'], (v) => v.m! * v.B! + v.A!, {
        m: [(v) => div(-v.A!, v.B!), '−{A} ÷ {B}', 'Take Ax to the other side, then divide by B.'],
        A: [(v) => -v.m! * v.B!, '−{m} × {B}', 'Multiply both sides by −B.'],
      }),
      rule('b = C ÷ B', '{b} = {C} ÷ {B}', ['b', 'C', 'B'], (v) => v.b! * v.B! - v.C!, {
        b: [(v) => div(v.C!, v.B!), '{C} ÷ {B}', 'Divide the right side by B.'],
        C: [(v) => v.b! * v.B!, '{b} × {B}', 'Multiply both sides by B.'],
      }),
    ],
    example: { A: 2, B: 3, C: 6, m: -2 / 3, b: 2 },
    startWith: ['A', 'B', 'C'],
    representation: {
      kind: 'linearFunction',
      slope: 'm',
      intercept: 'b',
      shade: '<',
      keep: ['B'],
      extent: 10,
    },
  }),

  // Elimination: a·x + b·y = c and d·x + e·y = g; the second times k, then added.
  page({
    id: 'g.m9-inequality-systems-elimination',
    title: 'Solving a system by elimination',
    use: 'Use this for solving two equations in standard form by multiplying one and adding them.',
    assumptions: [
      'ax + by = c and dx + ey = g; multiply the second by k so one letter cancels.',
      'The sum (a + kd)x + (b + ke)y = c + kg is true wherever both equations are.',
      'So its line goes through the solution too: with y gone it is the upright line x = ….',
    ],
    variables: [
      num('a', 'a', 'First x-coefficient', -20, 20, 1),
      num('b', 'b', 'First y-coefficient', -20, 20, 1),
      num('c', 'c', 'First right side', -100, 100, 1),
      num('d', 'd', 'Second x-coefficient', -20, 20, 1),
      num('e', 'e', 'Second y-coefficient', -20, 20, 1),
      num('g', 'g', 'Second right side', -100, 100, 1),
      num('k', 'k', 'Multiply the second by', -20, 20, 1),
      out('p', 'p', 'Sum x-coefficient'),
      out('q', 'q', 'Sum y-coefficient'),
      out('r', 'r', 'Sum right side'),
      out('x', 'x', 'Solution x'),
      out('y', 'y', 'Solution y'),
      out('m1', 'm₁', 'First slope'),
      out('i1', 'b₁', 'First intercept'),
      out('m2', 'm₂', 'Second slope'),
      out('i2', 'b₂', 'Second intercept'),
    ],
    rules: [
      rule(
        'p = a + kd',
        '{p} = {a} + {k} × {d}',
        ['p', 'a', 'k', 'd'],
        (v) => v.p! - (v.a! + v.k! * v.d!),
        {
          p: [
            (v) => v.a! + v.k! * v.d!,
            '{a} + {k} × {d}',
            'Add the x-terms: the second is k times as big.',
          ],
        },
      ),
      rule(
        'q = b + ke',
        '{q} = {b} + {k} × {e}',
        ['q', 'b', 'k', 'e'],
        (v) => v.q! - (v.b! + v.k! * v.e!),
        {
          q: [(v) => v.b! + v.k! * v.e!, '{b} + {k} × {e}', 'Add the y-terms: 0 when y cancels.'],
        },
      ),
      rule(
        'r = c + kg',
        '{r} = {c} + {k} × {g}',
        ['r', 'c', 'k', 'g'],
        (v) => v.r! - (v.c! + v.k! * v.g!),
        {
          r: [(v) => v.c! + v.k! * v.g!, '{c} + {k} × {g}', 'Add the right sides the same way.'],
        },
      ),
      rule(
        'x = (ce − bg) ÷ (ae − bd)',
        '{x} = ({c} × {e} − {b} × {g}) ÷ ({a} × {e} − {b} × {d})',
        ['x', 'c', 'e', 'b', 'g', 'a', 'd'],
        (v) => v.x! * (v.a! * v.e! - v.b! * v.d!) - (v.c! * v.e! - v.b! * v.g!),
        {
          x: [
            (v) => div(v.c! * v.e! - v.b! * v.g!, v.a! * v.e! - v.b! * v.d!),
            '({c} × {e} − {b} × {g}) ÷ ({a} × {e} − {b} × {d})',
            'With y cancelled, divide what is left on the right by what is left with x.',
          ],
        },
      ),
      rule(
        'y = (ag − cd) ÷ (ae − bd)',
        '{y} = ({a} × {g} − {c} × {d}) ÷ ({a} × {e} − {b} × {d})',
        ['y', 'a', 'g', 'c', 'd', 'e', 'b'],
        (v) => v.y! * (v.a! * v.e! - v.b! * v.d!) - (v.a! * v.g! - v.c! * v.d!),
        {
          y: [
            (v) => div(v.a! * v.g! - v.c! * v.d!, v.a! * v.e! - v.b! * v.d!),
            '({a} × {g} − {c} × {d}) ÷ ({a} × {e} − {b} × {d})',
            'The same with x cancelled instead: put x back into either equation to check.',
          ],
        },
      ),
      rule('m₁ = −a ÷ b', '{m1} = −{a} ÷ {b}', ['m1', 'a', 'b'], (v) => v.m1! * v.b! + v.a!, {
        m1: [(v) => div(-v.a!, v.b!), '−{a} ÷ {b}', 'The first line’s slope: solve for y.'],
      }),
      rule('b₁ = c ÷ b', '{i1} = {c} ÷ {b}', ['i1', 'c', 'b'], (v) => v.i1! * v.b! - v.c!, {
        i1: [(v) => div(v.c!, v.b!), '{c} ÷ {b}', 'The first line’s intercept.'],
      }),
      rule('m₂ = −d ÷ e', '{m2} = −{d} ÷ {e}', ['m2', 'd', 'e'], (v) => v.m2! * v.e! + v.d!, {
        m2: [(v) => div(-v.d!, v.e!), '−{d} ÷ {e}', 'The second line’s slope.'],
      }),
      rule('b₂ = g ÷ e', '{i2} = {g} ÷ {e}', ['i2', 'g', 'e'], (v) => v.i2! * v.e! - v.g!, {
        i2: [(v) => div(v.g!, v.e!), '{g} ÷ {e}', 'The second line’s intercept.'],
      }),
    ],
    example: {
      a: 2,
      b: 3,
      c: 12,
      d: 1,
      e: -1,
      g: 1,
      k: 3,
      p: 5,
      q: 0,
      r: 15,
      x: 3,
      y: 2,
      m1: -2 / 3,
      i1: 4,
      m2: 1,
      i2: -1,
    },
    startWith: ['a', 'b', 'c', 'd', 'e', 'g', 'k'],
    representation: {
      kind: 'lineSystem',
      lines: [
        { slope: 'm1', intercept: 'i1' },
        { slope: 'm2', intercept: 'i2' },
      ],
      solution: { x: 'x', y: 'y' },
      sum: { x: 'p', y: 'q', c: 'r' },
      fixed: true,
      extent: 10,
    },
  }),
];

// ── H17: compound inequalities and absolute value as a distance ──

/** 1 when a test holds, else 0; its check line. */
const truth = (b: boolean) => (b ? 1 : 0);
/** A worked number without float noise; a negative one in brackets after an operator. */
const clean = (x: number) => Number(x.toFixed(9));
const inner = (x: number) => (x < 0 ? `(${clean(x)})` : `${clean(x)}`);

/**
 * lo (s) a·x + b (s) hi ('and'), or a·x + b (s) lo or a·x + b (s) hi ('or'), solved to two
 * bounds on x (a > 0 keeps the signs), with a test number checked in the written form.
 */
function compoundPage(
  id: string,
  title: string,
  join: 'and' | 'or',
  closed: [boolean, boolean],
  example: Values,
): ModuleDef {
  const and = join === 'and';
  const [sLo, sHi] = and
    ? [closed[0] ? '≤' : '<', closed[1] ? '≤' : '<']
    : [closed[0] ? '≤' : '<', closed[1] ? '≥' : '>'];
  const at = (v: Values) => v.a! * v.t! + v.b!;
  const holds = (v: Values) => {
    const m = at(v);
    const lo = closed[0] ? (and ? m >= v.lo! : m <= v.lo!) : and ? m > v.lo! : m < v.lo!;
    const hi = closed[1] ? (and ? m <= v.hi! : m >= v.hi!) : and ? m < v.hi! : m > v.hi!;
    return and ? lo && hi : lo || hi;
  };
  const written = and ? `lo ${sLo} ax + b ${sHi} hi` : `ax + b ${sLo} lo or ax + b ${sHi} hi`;
  return page({
    id,
    title,
    use: and
      ? 'Use this for solving a compound inequality with “and”: the numbers between two bounds.'
      : 'Use this for solving a compound inequality with “or”: two rays, either part true.',
    assumptions: [
      and
        ? `${written}: both parts true at once, so x is between the two bounds.`
        : `${written}: either part true, so x is past one bound or the other.`,
      'Take b from every part, then divide every part by a (a > 0 keeps the signs).',
      'A closed circle (≤, ≥) takes in its bound; an open one (<, >) leaves it out.',
    ],
    variables: [
      num('a', 'a', 'x-coefficient', 1, 10, 1),
      num('b', 'b', 'Added to ax', -20, 20, 1),
      num('lo', and ? 'p' : 'p', and ? 'Left side' : 'First right side', -50, 50, 1),
      num('hi', 'q', and ? 'Right side' : 'Second right side', -50, 50, 1),
      out('L', 'L', 'Lower bound on x'),
      out('U', 'U', 'Upper bound on x'),
      num('t', 't', 'Test number'),
      { ...out('h', 'h', 'Test holds (1 true, 0 false)', 1), min: 0, integer: true },
    ],
    rules: [
      rule(
        'L = (p − b) ÷ a',
        '{L} = ({lo} − {b}) ÷ {a}',
        ['L', 'lo', 'b', 'a'],
        (v) => v.L! * v.a! - (v.lo! - v.b!),
        {
          L: [
            (v) => div(v.lo! - v.b!, v.a!),
            '({lo} − {b}) ÷ {a}',
            'Take b from both sides of that part, then divide by a.',
          ],
          lo: [
            (v) => v.L! * v.a! + v.b!,
            '{L} × {a} + {b}',
            'Undo the steps: multiply by a, add b.',
          ],
        },
      ),
      rule(
        'U = (q − b) ÷ a',
        '{U} = ({hi} − {b}) ÷ {a}',
        ['U', 'hi', 'b', 'a'],
        (v) => v.U! * v.a! - (v.hi! - v.b!),
        {
          U: [
            (v) => div(v.hi! - v.b!, v.a!),
            '({hi} − {b}) ÷ {a}',
            'The same steps on the other part: take b, then divide by a.',
          ],
          hi: [
            (v) => v.U! * v.a! + v.b!,
            '{U} × {a} + {b}',
            'Undo the steps: multiply by a, add b.',
          ],
        },
      ),
      rule(
        'h = test',
        and
          ? `test {t} in {lo} ${sLo} {a}x + {b} ${sHi} {hi}: {h}`
          : `test {t} in {a}x + {b} ${sLo} {lo} or {a}x + {b} ${sHi} {hi}: {h}`,
        ['h', 't', 'a', 'b', 'lo', 'hi'],
        (v) => v.h! - truth(holds(v)),
        {
          h: [
            (v) => truth(holds(v)),
            {
              expr: (v) => `${truth(holds(v))}`,
              how: `Put the test number in for x. ${and ? 'Both parts' : 'One part'} must be true: 1 is true, 0 is false.`,
              work: (v) => {
                const pt = clean(v.a! * v.t!);
                const m = clean(at(v));
                return [
                  `${v.a} × ${inner(v.t!)} = ${pt}`,
                  `${inner(pt)} ${v.b! < 0 ? '−' : '+'} ${Math.abs(v.b!)} = ${m}`,
                  and
                    ? `${v.lo} ${sLo} ${m} ${sHi} ${v.hi} is ${holds(v)}`
                    : `${m} ${sLo} ${v.lo} or ${m} ${sHi} ${v.hi} is ${holds(v)}`,
                ];
              },
              written: false,
            },
          ],
        },
        (v) => `${truth(holds(v))} = ${v.h}`,
      ),
    ],
    example,
    startWith: ['a', 'b', 'lo', 'hi', 't'],
    representation: {
      kind: 'integerLine',
      value: 'L',
      second: 'U',
      min: -5,
      max: 5,
      compound: { join, closed, test: 't' },
    },
  });
}

/** |x − c| (sign) d as a distance: the bounds c − d and c + d, a test number's distance. */
function distancePage(
  id: string,
  title: string,
  join: 'and' | 'or',
  closed: boolean,
  example: Values,
): ModuleDef {
  const and = join === 'and';
  const sign = and ? (closed ? '≤' : '<') : closed ? '≥' : '>';
  const holds = (v: Values) => {
    const e = Math.abs(v.t! - v.c!);
    return and ? (closed ? e <= v.d! : e < v.d!) : closed ? e >= v.d! : e > v.d!;
  };
  return page({
    id,
    title,
    use: and
      ? `Use this for solving |x − c| ${sign} d: the numbers within d of c, between two bounds.`
      : `Use this for solving |x − c| ${sign} d: the numbers farther than d from c, two rays.`,
    assumptions: [
      '|x − c| is the distance from x to c on the number line.',
      and
        ? `|x − c| ${sign} d: within d of c, so c − d ${closed ? '≤' : '<'} x ${closed ? '≤' : '<'} c + d.`
        : `|x − c| ${sign} d: farther than d from c, so x ${closed ? '≤' : '<'} c − d or x ${sign} c + d.`,
      'Drag the center, the upper bound (the distance) or the test number.',
    ],
    variables: [
      num('c', 'c', 'Center'),
      num('d', 'd', 'Distance', 0, 20),
      out('L', 'L', 'Lower bound'),
      out('U', 'U', 'Upper bound'),
      num('t', 't', 'Test number'),
      out('e', 'e', 'Test distance from c'),
      { ...out('h', 'h', 'Test holds (1 true, 0 false)', 1), min: 0, integer: true },
    ],
    rules: [
      rule('L = c − d', '{L} = {c} − {d}', ['L', 'c', 'd'], (v) => v.L! - (v.c! - v.d!), {
        L: [(v) => v.c! - v.d!, '{c} − {d}', 'Go the distance d to the left of the center.'],
        c: [(v) => v.L! + v.d!, '{L} + {d}', 'Add d to both sides.'],
        d: [(v) => v.c! - v.L!, '{c} − {L}', 'The distance from the lower bound up to c.'],
      }),
      rule('U = c + d', '{U} = {c} + {d}', ['U', 'c', 'd'], (v) => v.U! - (v.c! + v.d!), {
        U: [(v) => v.c! + v.d!, '{c} + {d}', 'Go the distance d to the right of the center.'],
      }),
      rule(
        'e = |t − c|',
        '{e} = |{t} − {c}|',
        ['e', 't', 'c'],
        (v) => v.e! - Math.abs(v.t! - v.c!),
        {
          e: [(v) => Math.abs(v.t! - v.c!), '|{t} − {c}|', 'The test number’s distance from c.'],
        },
      ),
      rule(
        'h = test',
        `test: {e} ${sign} {d} gives {h}`,
        ['h', 'e', 'd'],
        (v) =>
          v.h! -
          truth(and ? (closed ? v.e! <= v.d! : v.e! < v.d!) : closed ? v.e! >= v.d! : v.e! > v.d!),
        {
          h: [
            (v) =>
              truth(
                and ? (closed ? v.e! <= v.d! : v.e! < v.d!) : closed ? v.e! >= v.d! : v.e! > v.d!,
              ),
            {
              expr: (v) => `${truth(holds(v))}`,
              how: `Compare the test number’s distance with d: 1 is true, 0 is false.`,
              work: (v) => [`${clean(v.e!)} ${sign} ${v.d} is ${holds(v)}`],
              written: false,
            },
          ],
        },
        (v) => `${truth(holds(v))} = ${v.h}`,
      ),
    ],
    example,
    startWith: ['c', 'd', 't'],
    representation: {
      kind: 'integerLine',
      value: 'L',
      second: 'U',
      min: -5,
      max: 5,
      compound: { join, closed: [closed, closed], center: 'c', radius: 'd', test: 't' },
    },
  });
}

const H17_MODULES: ModuleDef[] = [
  // −3 ≤ 2x + 1 < 7: −2 ≤ x < 3.
  compoundPage(
    'g.m9-linear-inequalities-and',
    'Compound inequality with and',
    'and',
    [true, false],
    {
      a: 2,
      b: 1,
      lo: -3,
      hi: 7,
      L: -2,
      U: 3,
      t: 1,
      h: 1,
    },
  ),
  // 2x + 1 < −3 or 2x + 1 ≥ 7: x < −2 or x ≥ 3.
  compoundPage('g.m9-linear-inequalities-or', 'Compound inequality with or', 'or', [false, true], {
    a: 2,
    b: 1,
    lo: -3,
    hi: 7,
    L: -2,
    U: 3,
    t: 1,
    h: 0,
  }),
  // The edge: 2x + 1 < 9 or 2x + 1 ≥ 3 overlap, x < 4 or x ≥ 1: every number.
  compoundPage(
    'g.m9-linear-inequalities-or-all',
    'Compound inequality: every number',
    'or',
    [false, true],
    {
      a: 2,
      b: 1,
      lo: 9,
      hi: 3,
      L: 4,
      U: 1,
      t: 6,
      h: 1,
    },
  ),
  // |x − 1| ≤ 3: −2 ≤ x ≤ 4.
  distancePage('g.m9-absolute-value-within', 'Absolute value inequality: within', 'and', true, {
    c: 1,
    d: 3,
    L: -2,
    U: 4,
    t: 5,
    e: 4,
    h: 0,
  }),
  // |x + 2.5| > 1.5: x < −4 or x > −1.
  distancePage('g.m9-absolute-value-beyond', 'Absolute value inequality: beyond', 'or', false, {
    c: -2.5,
    d: 1.5,
    L: -4,
    U: -1,
    t: 0.5,
    e: 3,
    h: 1,
  }),
];

// ── H18: residuals, r and the least-squares line ──

/** ŷ = mx + b: the line's prediction at x. */
const predict = rule(
  'ŷ = mx + b',
  '{y} = {m} × {x} + {b}',
  ['y', 'm', 'x', 'b'],
  (v) => v.y! - (v.m! * v.x! + v.b!),
  {
    y: [
      (v) => v.m! * v.x! + v.b!,
      '{m} × {x} + {b}',
      'Put x into the line: slope times x, plus b.',
    ],
    x: [
      (v) => div(v.y! - v.b!, v.m!),
      '({y} − {b}) ÷ {m}',
      'Subtract b from the prediction, then divide by the slope.',
    ],
  },
);

/** Hours studied and quiz scores (made up for the demo). */
const STUDY: [number, number][] = [
  [1, 48],
  [2, 57],
  [3, 59],
  [4, 68],
  [5, 68],
  [6, 77],
  [7, 78],
  [8, 87],
];
/** Afternoon temperature (°C) and hot drinks sold (made up). */
const DRINKS: [number, number][] = [
  [10, 42],
  [15, 38],
  [20, 36],
  [25, 29],
  [30, 31],
  [35, 24],
  [40, 20],
  [45, 21],
];
/** Practice runs and mistakes in the last run (made up): a weak pattern. */
const PRACTICE: [number, number][] = [
  [2, 9],
  [3, 4],
  [4, 8],
  [5, 3],
  [6, 7],
  [7, 6],
  [8, 2],
  [9, 5],
  [10, 4],
];

const H18_MODULES: ModuleDef[] = [
  page({
    id: 'g.m9-regression-residuals',
    title: 'Residuals and the residual plot',
    use: 'Use this for finding residuals (actual − predicted) and reading a residual plot.',
    assumptions: [
      'A residual is the actual y minus the y the line predicts: above the line is positive.',
      'The residual plot puts each residual over its x, about a line at 0.',
      'Drag either end of the line and watch the residuals change.',
    ],
    variables: [
      num('m', 'm', 'Slope', -20, 20, 0.5),
      num('b', 'b', 'Intercept', 0, 100, 0.5),
      num('x', 'x', 'Hours studied', 0, 9, 0.5),
      out('y', 'ŷ', 'Predicted score'),
      out('e', 'e', 'Residual at 4 hours'),
    ],
    rules: [
      predict,
      rule(
        'e = 68 − (4m + b)',
        '{e} = 68 − ({m} × 4 + {b})',
        ['e', 'm', 'b'],
        (v) => v.e! - (68 - (v.m! * 4 + v.b!)),
        {
          e: [
            (v) => 68 - (v.m! * 4 + v.b!),
            '68 − ({m} × 4 + {b})',
            'The point (4, 68): its actual score minus the line’s prediction at 4.',
          ],
        },
      ),
    ],
    example: { m: 5, b: 45, x: 6, y: 75, e: 3 },
    startWith: ['m', 'b', 'x'],
    representation: {
      kind: 'scatter',
      x: { label: 'Hours studied', min: 0, max: 9 },
      y: { label: 'Quiz score', min: 40, max: 100 },
      points: STUDY,
      slope: 'm',
      intercept: 'b',
      at: { x: 'x', y: 'y' },
      residuals: 'plot',
      residualOf: { point: 3, residual: 'e' },
    },
  }),
  page({
    id: 'g.m9-regression-least-squares',
    title: 'The least-squares line and r',
    use: 'Use this for predicting with the least-squares line and reading the correlation r.',
    assumptions: [
      'The least-squares line makes the sum of the squared residuals as small as it can be.',
      'r runs from −1 to 1: its sign is the direction, its size how close the points are to a line.',
      'A calculator gives the line and r; here they are rounded to two places.',
    ],
    variables: [
      num('x', 'x', 'Temperature (°C)', 0, 50, 0.5),
      out('y', 'ŷ', 'Predicted drinks sold'),
    ],
    rules: [
      rule(
        'ŷ = −0.65x + 47.87',
        '{y} = −0.65 × {x} + 47.87',
        ['y', 'x'],
        (v) => v.y! - (-0.65 * v.x! + 47.87),
        {
          y: [
            (v) => -0.65 * v.x! + 47.87,
            '−0.65 × {x} + 47.87',
            'Put the temperature into the line.',
          ],
          x: [
            (v) => (v.y! - 47.87) / -0.65,
            '({y} − 47.87) ÷ (−0.65)',
            'Subtract 47.87, then divide by the slope, −0.65.',
          ],
        },
      ),
    ],
    example: { x: 28, y: 29.67 },
    startWith: ['x'],
    representation: {
      kind: 'scatter',
      x: { label: 'Temperature (°C)', min: 0, max: 50 },
      y: { label: 'Hot drinks sold', min: 0, max: 50 },
      points: DRINKS,
      slope: -0.65,
      intercept: 47.87,
      at: { x: 'x', y: 'y' },
      r: true,
      residuals: 'segments',
      leastSquares: 'fit',
    },
  }),
  // The edge: a weak pattern, where a line predicts little.
  page({
    id: 'g.m9-regression-weak',
    title: 'Fitting a line to a weak pattern',
    use: 'Use this for comparing your own line of fit with the least-squares line.',
    assumptions: [
      'Drag the line until the squared residuals add up to as little as you can.',
      'The dashed line is the least-squares line: no line does better.',
      'With r near 0 the points hardly follow a line, so its predictions are rough.',
    ],
    variables: [
      num('m', 'm', 'Slope', -5, 5, 0.1),
      num('b', 'b', 'Intercept', -10, 20, 0.1),
      num('x', 'x', 'Practice runs', 0, 11, 0.5),
      out('y', 'ŷ', 'Predicted mistakes'),
    ],
    rules: [predict],
    example: { m: -0.6, b: 9, x: 6, y: 5.4 },
    startWith: ['x', 'm', 'b'],
    representation: {
      kind: 'scatter',
      x: { label: 'Practice runs', min: 0, max: 11 },
      y: { label: 'Mistakes', min: 0, max: 10 },
      points: PRACTICE,
      slope: 'm',
      intercept: 'b',
      at: { x: 'x', y: 'y' },
      r: true,
      residuals: 'segments',
      leastSquares: 'beside',
    },
  }),
];

// ── H19: outliers past the fences, two box plots, the standard deviation band ──

/** A list of value ids as step text: "{d1}, {d2}, …". */
const listOf = (ids: string[]) => ids.map((id) => `{${id}}`).join(', ');
const valuesOf = (v: Values, ids: string[]) => ids.map((id) => v[id]!);
const medianList = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2]! : (s[n / 2 - 1]! + s[n / 2]!) / 2;
};

const NAMES5 = ['least', 'first quartile', 'median', 'third quartile', 'greatest'];

/** Minutes of homework on eleven nights (made up): one long night. */
const NIGHTS = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11'];

/** A rule that reads one summary number from a list (solved for that number only). */
const summary = (
  id: string,
  target: string,
  word: string,
  ids: string[],
  fn: (xs: number[]) => number | undefined,
  how: string,
) =>
  rule(
    id,
    `{${target}} = ${word} of ${listOf(ids)}`,
    [target, ...ids],
    (v) => v[target]! - (fn(valuesOf(v, ids)) ?? NaN),
    { [target]: [(v) => fn(valuesOf(v, ids)), `${word} of ${listOf(ids)}`, how] },
  );

/** Two box plots' rule: the interquartile range, Q₃ − Q₁. */
const iqrRule = (I: string, q3: string, q1: string) =>
  rule(
    `${I} = ${q3} − ${q1}`,
    `{${I}} = {${q3}} − {${q1}}`,
    [I, q3, q1],
    (v) => v[I]! - (v[q3]! - v[q1]!),
    {
      [I]: [
        (v) => v[q3]! - v[q1]!,
        `{${q3}} − {${q1}}`,
        'The width of the box: the middle half of the data.',
      ],
    },
  );

/** Five numbers in order, as constraints. */
const inOrder = (ids: string[]) =>
  ids.slice(1).map((big, i) => ({
    relation: {
      id: `${big} ≥ ${ids[i]}`,
      constraint: true as const,
      display: `{${big}} is at least {${ids[i]}}`,
      vars: [big, ids[i]!],
      residual: (v: Values) => (v[big]! >= v[ids[i]!]! ? 0 : 1),
      solve: {},
    },
    steps: {},
  }));

/** Eight values, their mean and their standard deviation (σ over n or s over n − 1). */
function spreadPage(
  id: string,
  title: string,
  kind: 'population' | 'sample',
  example: number[],
  range: [number, number],
): ModuleDef {
  const ids = example.map((_, i) => `x${i + 1}`);
  const n = ids.length;
  const d = kind === 'sample' ? n - 1 : n;
  const sym = kind === 'sample' ? 's' : 'σ';
  const m = example.reduce((a, b) => a + b, 0) / n;
  const S = example.reduce((a, x) => a + (x - m) ** 2, 0);
  return page({
    id,
    title,
    use:
      kind === 'sample'
        ? 'Use this for the sample standard deviation s, dividing by n − 1, and one value far out.'
        : 'Use this for the mean and the standard deviation σ of a data set, on a dot plot.',
    assumptions: [
      'The mean is the balance point: add the values, divide by how many there are.',
      kind === 'sample'
        ? 's = √(sum of squared deviations ÷ (n − 1)) for a sample.'
        : 'σ = √(sum of squared deviations ÷ n): the typical distance from the mean.',
      'The band runs one standard deviation either side of the mean.',
    ],
    variables: [
      ...ids.map((x, i) => num(x, `x${'₁₂₃₄₅₆₇₈'[i]}`, `Value ${i + 1}`, 0, 100, 1)),
      out('m', 'x̄', 'Mean'),
      { ...out('S', 'S', 'Sum of squared deviations'), min: 0 },
      { ...out('sd', sym, 'Standard deviation'), min: 0 },
    ],
    rules: [
      rule(
        'x̄ = sum ÷ n',
        `{m} = (${ids.map((x) => `{${x}}`).join(' + ')}) ÷ ${n}`,
        ['m', ...ids],
        (v) => v.m! - valuesOf(v, ids).reduce((a, b) => a + b, 0) / n,
        {
          m: [
            (v) => valuesOf(v, ids).reduce((a, b) => a + b, 0) / n,
            `(${ids.map((x) => `{${x}}`).join(' + ')}) ÷ ${n}`,
            `Add the ${n} values, then divide by ${n}.`,
          ],
        },
      ),
      rule(
        'S = Σ(x − x̄)²',
        `{S} = ${ids.map((x) => `({${x}} − {m})²`).join(' + ')}`,
        ['S', 'm', ...ids],
        (v) => v.S! - valuesOf(v, ids).reduce((a, x) => a + (x - v.m!) ** 2, 0),
        {
          S: [
            (v) => valuesOf(v, ids).reduce((a, x) => a + (x - v.m!) ** 2, 0),
            ids.map((x) => `({${x}} − {m})²`).join(' + '),
            'Each value’s distance from the mean, squared, all added.',
          ],
        },
      ),
      rule(
        `${sym} = √(S ÷ ${d})`,
        `{sd} = √({S} ÷ ${d})`,
        ['sd', 'S'],
        (v) => v.sd! - Math.sqrt(v.S! / d),
        {
          sd: [
            (v) => Math.sqrt(v.S! / d),
            `√({S} ÷ ${d})`,
            kind === 'sample'
              ? `Divide by n − 1 = ${d} for a sample, then take the square root.`
              : `Divide by n = ${d}, then take the square root.`,
          ],
          S: [(v) => v.sd! ** 2 * d, `{sd}² × ${d}`, `Square it, then multiply by ${d}.`],
        },
      ),
    ],
    example: {
      ...Object.fromEntries(ids.map((x, i) => [x, example[i]!])),
      m,
      S,
      sd: Math.sqrt(S / d),
    },
    startWith: ids,
    representation: {
      kind: 'dotPlot',
      data: ids,
      min: range[0],
      max: range[1],
      mean: 'm',
      sd: { id: 'sd', kind },
    },
  });
}

const H19_MODULES: ModuleDef[] = [
  page({
    id: 'g.m9-data-displays-outliers',
    title: 'Outliers and the 1.5 × IQR fences',
    use: 'Use this for deciding which values are outliers, past Q₁ − 1.5 × IQR or Q₃ + 1.5 × IQR.',
    assumptions: [
      'Q₁ and Q₃ are the medians of the lower and upper halves (the median left out).',
      'The fences sit 1.5 × IQR below Q₁ and above Q₃; a value past one is an outlier.',
      'The whiskers stop at the last values inside the fences; outliers are open dots.',
    ],
    variables: [
      ...NIGHTS.map((x, i) =>
        num(
          x,
          `x${[...String(i + 1)].map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join('')}`,
          `Night ${i + 1} (minutes)`,
          0,
          120,
          1,
        ),
      ),
      out('a', 'min', 'Least'),
      out('b', 'Q₁', 'First quartile'),
      out('c', 'M', 'Median'),
      out('d', 'Q₃', 'Third quartile'),
      out('e', 'max', 'Greatest'),
      out('I', 'IQR', 'Interquartile range'),
      out('L', 'L', 'Lower fence'),
      out('U', 'U', 'Upper fence'),
    ],
    rules: [
      summary('min', 'a', 'least', NIGHTS, (xs) => Math.min(...xs), 'The smallest value.'),
      summary(
        'Q₁',
        'b',
        'first quartile',
        NIGHTS,
        (xs) => quartile(xs, 1),
        'The median of the values below the median.',
      ),
      summary('M', 'c', 'median', NIGHTS, medianList, 'The middle value once they are in order.'),
      summary(
        'Q₃',
        'd',
        'third quartile',
        NIGHTS,
        (xs) => quartile(xs, 3),
        'The median of the values above the median.',
      ),
      summary('max', 'e', 'greatest', NIGHTS, (xs) => Math.max(...xs), 'The largest value.'),
      iqrRule('I', 'd', 'b'),
      rule(
        'L = Q₁ − 1.5 × IQR',
        '{L} = {b} − 1.5 × {I}',
        ['L', 'b', 'I'],
        (v) => v.L! - (v.b! - 1.5 * v.I!),
        {
          L: [
            (v) => v.b! - 1.5 * v.I!,
            '{b} − 1.5 × {I}',
            'Go 1.5 box-widths below the first quartile.',
          ],
        },
      ),
      rule(
        'U = Q₃ + 1.5 × IQR',
        '{U} = {d} + 1.5 × {I}',
        ['U', 'd', 'I'],
        (v) => v.U! - (v.d! + 1.5 * v.I!),
        {
          U: [
            (v) => v.d! + 1.5 * v.I!,
            '{d} + 1.5 × {I}',
            'Go 1.5 box-widths above the third quartile.',
          ],
        },
      ),
    ],
    example: {
      n1: 21,
      n2: 15,
      n3: 27,
      n4: 12,
      n5: 45,
      n6: 19,
      n7: 24,
      n8: 16,
      n9: 22,
      n10: 25,
      n11: 18,
      a: 12,
      b: 16,
      c: 21,
      d: 25,
      e: 45,
      I: 9,
      L: 2.5,
      U: 38.5,
    },
    startWith: NIGHTS,
    representation: {
      kind: 'boxPlot',
      min: 'a',
      q1: 'b',
      median: 'c',
      q3: 'd',
      max: 'e',
      range: [0, 50],
      data: NIGHTS,
      fences: { lower: 'L', upper: 'U' },
    },
  }),
  page({
    id: 'g.m9-data-displays-compare',
    title: 'Two box plots on one scale',
    use: 'Use this for comparing two data sets by their medians and interquartile ranges.',
    assumptions: [
      'Both box plots share one number line, so their boxes line up.',
      'The median compares the centers; the IQR (the box’s width) compares the spreads.',
      'Drag any mark of either plot.',
    ],
    variables: [
      ...['a1', 'b1', 'c1', 'd1', 'e1'].map((x, i) =>
        num(x, `${['min', 'Q₁', 'M', 'Q₃', 'max'][i]} (A)`, `Class A ${NAMES5[i]}`, 0, 100, 1),
      ),
      ...['a2', 'b2', 'c2', 'd2', 'e2'].map((x, i) =>
        num(x, `${['min', 'Q₁', 'M', 'Q₃', 'max'][i]} (B)`, `Class B ${NAMES5[i]}`, 0, 100, 1),
      ),
      out('I1', 'IQR (A)', 'Class A interquartile range'),
      out('I2', 'IQR (B)', 'Class B interquartile range'),
      out('D', 'D', 'Difference of medians (B − A)'),
    ],
    rules: [
      ...inOrder(['a1', 'b1', 'c1', 'd1', 'e1']),
      ...inOrder(['a2', 'b2', 'c2', 'd2', 'e2']),
      iqrRule('I1', 'd1', 'b1'),
      iqrRule('I2', 'd2', 'b2'),
      rule('D = M_B − M_A', '{D} = {c2} − {c1}', ['D', 'c2', 'c1'], (v) => v.D! - (v.c2! - v.c1!), {
        D: [(v) => v.c2! - v.c1!, '{c2} − {c1}', 'How far B’s median is above A’s.'],
      }),
    ],
    example: {
      a1: 52,
      b1: 64,
      c1: 71,
      d1: 78,
      e1: 90,
      a2: 58,
      b2: 72,
      c2: 80,
      d2: 84,
      e2: 97,
      I1: 14,
      I2: 12,
      D: 9,
    },
    startWith: ['a1', 'b1', 'c1', 'd1', 'e1', 'a2', 'b2', 'c2', 'd2', 'e2'],
    representation: {
      kind: 'boxPlot',
      min: 'a1',
      q1: 'b1',
      median: 'c1',
      q3: 'd1',
      max: 'e1',
      range: [40, 100],
      second: { min: 'a2', q1: 'b2', median: 'c2', q3: 'd2', max: 'e2' },
      labels: ['Class A', 'Class B'],
    },
  }),
  spreadPage(
    'g.m9-data-displays-sd',
    'Mean and standard deviation',
    'population',
    [3, 4, 5, 6, 6, 7, 8, 9],
    [0, 12],
  ),
  // The edge: one value far out pulls the sample standard deviation wide.
  spreadPage(
    'g.m9-data-displays-sd-sample',
    'Sample standard deviation',
    'sample',
    [12, 14, 15, 15, 16, 17, 18, 29],
    [10, 30],
  ),
];

// ── H20: two-way tables, relative frequency, chi-square ──

/** A count typed into a table (whole, 0 to 500). */
const count = (id: string, name: string) => ({
  id,
  symbol: id,
  name,
  min: 0,
  max: 500,
  step: 1,
  integer: true,
});
/** "{a} + {b} + …" */
const plus = (ids: string[]) => ids.map((x) => `{${x}}`).join(' + ');
const add = (v: Values, ids: string[]) => ids.reduce((s, x) => s + v[x]!, 0);

/** total = the counts added. */
const totalRule = (t: string, ids: string[], how: string) =>
  rule(
    `${t} = ${ids.join(' + ')}`,
    `{${t}} = ${plus(ids)}`,
    [t, ...ids],
    (v) => v[t]! - add(v, ids),
    {
      [t]: [(v) => add(v, ids), plus(ids), how],
    },
  );

/** f = part ÷ whole, a relative frequency. */
const shareRule = (f: string, part: string, whole: string, how: string) =>
  rule(
    `${f} = ${part} ÷ ${whole}`,
    `{${f}} = {${part}} ÷ {${whole}}`,
    [f, part, whole],
    (v) => v[f]! * v[whole]! - v[part]!,
    {
      [f]: [(v) => div(v[part]!, v[whole]!), `{${part}} ÷ {${whole}}`, how],
    },
  );

const H20_MODULES: ModuleDef[] = [
  page({
    id: 'g.m9-two-way-tables-joint',
    title: 'Two-way table: joint relative frequency',
    use: 'Use this for a joint relative frequency: one cell out of the grand total.',
    assumptions: [
      'Each count is the students in one row and one column at once.',
      'The totals add each row, each column, and everything.',
      'A joint relative frequency is one cell ÷ the grand total.',
    ],
    variables: [
      count('a', 'Sport, Grade 9'),
      count('b', 'Sport, Grade 10'),
      count('c', 'No sport, Grade 9'),
      count('d', 'No sport, Grade 10'),
      { ...out('N', 'N', 'Grand total'), min: 0 },
      { ...out('f', 'f', 'Joint relative frequency'), min: 0 },
    ],
    rules: [
      totalRule('N', ['a', 'b', 'c', 'd'], 'Add all four counts.'),
      shareRule('f', 'a', 'N', 'The lit cell out of everyone.'),
    ],
    example: { a: 36, b: 28, c: 24, d: 32, N: 120, f: 0.3 },
    startWith: ['a', 'b', 'c', 'd'],
    representation: {
      kind: 'table',
      twoWay: {
        rows: ['Sport', 'No sport'],
        cols: ['Grade 9', 'Grade 10'],
        cells: [
          ['a', 'b'],
          ['c', 'd'],
        ],
        lit: { row: 0, col: 0 },
        frequency: 'f',
        bar: 'rows',
      },
    },
  }),
  page({
    id: 'g.m9-two-way-tables-marginal',
    title: 'Two-way table: marginal relative frequency',
    use: 'Use this for a marginal relative frequency: a row total out of the grand total.',
    assumptions: [
      'A marginal relative frequency uses a total at the edge (the margin) of the table.',
      'It is a row (or column) total ÷ the grand total.',
      'The segmented bars compare each column split by the rows.',
    ],
    variables: [
      count('a', 'Left-handed, plays an instrument'),
      count('b', 'Left-handed, does not'),
      count('c', 'Right-handed, plays an instrument'),
      count('d', 'Right-handed, does not'),
      { ...out('L', 'L', 'Left-handed total'), min: 0 },
      { ...out('N', 'N', 'Grand total'), min: 0 },
      { ...out('f', 'f', 'Marginal relative frequency'), min: 0 },
    ],
    rules: [
      totalRule('L', ['a', 'b'], 'Add the left-handed row.'),
      totalRule('N', ['a', 'b', 'c', 'd'], 'Add all four counts.'),
      shareRule('f', 'L', 'N', 'The row total out of everyone.'),
    ],
    example: { a: 6, b: 9, c: 39, d: 66, L: 15, N: 120, f: 0.125 },
    startWith: ['a', 'b', 'c', 'd'],
    representation: {
      kind: 'table',
      twoWay: {
        rows: ['Left', 'Right'],
        cols: ['Instrument', 'None'],
        cells: [
          ['a', 'b'],
          ['c', 'd'],
        ],
        lit: { row: 0 },
        frequency: 'f',
        bar: 'cols',
      },
    },
  }),
  page({
    id: 'g.m10-conditional-probability-table',
    title: 'Conditional probability from a two-way table',
    use: 'Use this for P(A | B) from a table: the cell out of the B column only.',
    assumptions: [
      'P(Late | Bus) looks only at the bus column: those late out of all who took the bus.',
      'The whole is the column total, not the grand total.',
      'The bars show each column as 100%: compare the late part across them.',
    ],
    variables: [
      count('a', 'Late, bus'),
      count('b', 'Late, walk'),
      count('g', 'Late, car'),
      count('d', 'On time, bus'),
      count('e', 'On time, walk'),
      count('h', 'On time, car'),
      { ...out('B', 'B', 'Bus total'), min: 0 },
      { ...out('p', 'P', 'P(Late | Bus)'), min: 0 },
      { ...out('T', 'T', 'Late total'), min: 0 },
      { ...out('N', 'N', 'Grand total'), min: 0 },
      { ...out('q', 'Q', 'P(Late), everyone'), min: 0 },
    ],
    rules: [
      totalRule('B', ['a', 'd'], 'Add the bus column.'),
      shareRule('p', 'a', 'B', 'Late among the bus riders only.'),
      totalRule('T', ['a', 'b', 'g'], 'Add the late row.'),
      totalRule('N', ['a', 'b', 'g', 'd', 'e', 'h'], 'Add all six counts.'),
      shareRule('q', 'T', 'N', 'Late out of everyone, to compare with the bus riders.'),
    ],
    example: { a: 12, b: 5, g: 3, d: 36, e: 45, h: 19, B: 48, p: 0.25, T: 20, N: 120, q: 1 / 6 },
    startWith: ['a', 'b', 'g', 'd', 'e', 'h'],
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
    id: 'g.m12-chi-square-independence',
    title: 'Chi-square test of independence',
    use: 'Use this for χ² from a two-way table: expected counts, then Σ (O − E)² ÷ E.',
    assumptions: [
      'If the two are independent, each cell expects row total × column total ÷ grand total.',
      'χ² adds (observed − expected)² ÷ expected over every cell: big means far from independent.',
      'A 2 × 2 table has (2 − 1) × (2 − 1) = 1 degree of freedom.',
    ],
    variables: [
      count('a', 'Sport, likes early classes'),
      count('b', 'Sport, does not'),
      count('c', 'No sport, likes early classes'),
      count('d', 'No sport, does not'),
      { ...out('N', 'N', 'Grand total'), min: 0 },
      { ...out('E1', 'E₁', 'Expected, first cell'), min: 0 },
      { ...out('E2', 'E₂', 'Expected, second cell'), min: 0 },
      { ...out('E3', 'E₃', 'Expected, third cell'), min: 0 },
      { ...out('E4', 'E₄', 'Expected, fourth cell'), min: 0 },
      { ...out('X', 'χ²', 'Chi-square'), min: 0 },
    ],
    rules: [
      totalRule('N', ['a', 'b', 'c', 'd'], 'Add all four counts.'),
      ...(
        [
          ['E1', ['a', 'b'], ['a', 'c']],
          ['E2', ['a', 'b'], ['b', 'd']],
          ['E3', ['c', 'd'], ['a', 'c']],
          ['E4', ['c', 'd'], ['b', 'd']],
        ] as const
      ).map(([E, r, k]) =>
        rule(
          `${E} = row × column ÷ N`,
          `{${E}} = ({${r[0]}} + {${r[1]}}) × ({${k[0]}} + {${k[1]}}) ÷ {N}`,
          [...new Set([E, r[0], r[1], k[0], k[1], 'N'])],
          (v) => v[E]! * v.N! - (v[r[0]]! + v[r[1]]!) * (v[k[0]]! + v[k[1]]!),
          {
            [E]: [
              (v) => div((v[r[0]]! + v[r[1]]!) * (v[k[0]]! + v[k[1]]!), v.N!),
              `({${r[0]}} + {${r[1]}}) × ({${k[0]}} + {${k[1]}}) ÷ {N}`,
              'Row total × column total ÷ grand total.',
            ],
          },
        ),
      ),
      rule(
        'χ² = Σ (O − E)² ÷ E',
        '{X} = ({a} − {E1})² ÷ {E1} + ({b} − {E2})² ÷ {E2} + ({c} − {E3})² ÷ {E3} + ({d} − {E4})² ÷ {E4}',
        ['X', 'a', 'b', 'c', 'd', 'E1', 'E2', 'E3', 'E4'],
        (v) =>
          v.X! -
          ((v.a! - v.E1!) ** 2 / v.E1! +
            (v.b! - v.E2!) ** 2 / v.E2! +
            (v.c! - v.E3!) ** 2 / v.E3! +
            (v.d! - v.E4!) ** 2 / v.E4!),
        {
          X: [
            (v) =>
              [v.E1!, v.E2!, v.E3!, v.E4!].every((e) => e > 0)
                ? (v.a! - v.E1!) ** 2 / v.E1! +
                  (v.b! - v.E2!) ** 2 / v.E2! +
                  (v.c! - v.E3!) ** 2 / v.E3! +
                  (v.d! - v.E4!) ** 2 / v.E4!
                : undefined,
            '({a} − {E1})² ÷ {E1} + ({b} − {E2})² ÷ {E2} + ({c} − {E3})² ÷ {E3} + ({d} − {E4})² ÷ {E4}',
            'For each cell: the gap from expected, squared, over expected; then add them.',
          ],
        },
      ),
    ],
    example: {
      a: 30,
      b: 20,
      c: 20,
      d: 30,
      N: 100,
      E1: 25,
      E2: 25,
      E3: 25,
      E4: 25,
      X: 4,
    },
    startWith: ['a', 'b', 'c', 'd'],
    representation: {
      kind: 'table',
      twoWay: {
        rows: ['Sport', 'No sport'],
        cols: ['Early', 'Not early'],
        cells: [
          ['a', 'b'],
          ['c', 'd'],
        ],
        expected: 'independence',
        chiSquare: 'X',
      },
    },
  }),
  // The edge: one row, goodness of fit against equal shares.
  page({
    id: 'g.m12-chi-square-goodness',
    title: 'Chi-square goodness of fit',
    use: 'Use this for a goodness-of-fit test: do the counts fit equal shares?',
    assumptions: [
      'If every day is equally likely, each expects the total ÷ 4.',
      'χ² adds (observed − expected)² ÷ expected over the four days.',
      'Four categories give 4 − 1 = 3 degrees of freedom.',
    ],
    variables: [
      count('o1', 'Monday'),
      count('o2', 'Tuesday'),
      count('o3', 'Wednesday'),
      count('o4', 'Thursday'),
      { ...out('N', 'N', 'Total'), min: 0 },
      { ...out('E', 'E', 'Expected each day'), min: 0 },
      { ...out('X', 'χ²', 'Chi-square'), min: 0 },
    ],
    rules: [
      totalRule('N', ['o1', 'o2', 'o3', 'o4'], 'Add the four days.'),
      rule('E = N ÷ 4', '{E} = {N} ÷ 4', ['E', 'N'], (v) => v.E! - v.N! / 4, {
        E: [(v) => v.N! / 4, '{N} ÷ 4', 'Equal shares: the total split four ways.'],
      }),
      rule(
        'χ² = Σ (O − E)² ÷ E',
        '{X} = (({o1} − {E})² + ({o2} − {E})² + ({o3} − {E})² + ({o4} − {E})²) ÷ {E}',
        ['X', 'o1', 'o2', 'o3', 'o4', 'E'],
        (v) => v.X! - ['o1', 'o2', 'o3', 'o4'].reduce((s, o) => s + (v[o]! - v.E!) ** 2, 0) / v.E!,
        {
          X: [
            (v) =>
              v.E! > 0
                ? ['o1', 'o2', 'o3', 'o4'].reduce((s, o) => s + (v[o]! - v.E!) ** 2, 0) / v.E!
                : undefined,
            '(({o1} − {E})² + ({o2} − {E})² + ({o3} − {E})² + ({o4} − {E})²) ÷ {E}',
            'Each day’s gap from expected, squared, added, then over the expected count.',
          ],
        },
      ),
    ],
    example: { o1: 22, o2: 18, o3: 25, o4: 15, N: 80, E: 20, X: 2.9 },
    startWith: ['o1', 'o2', 'o3', 'o4'],
    representation: {
      kind: 'table',
      twoWay: {
        rows: ['Visits'],
        cols: ['Mon', 'Tue', 'Wed', 'Thu'],
        cells: [['o1', 'o2', 'o3', 'o4']],
        expected: [['E', 'E', 'E', 'E']],
        chiSquare: 'X',
      },
    },
  }),
];

// ── H21: probability trees with a chance on every branch ──

/** A probability typed on a branch (0 to 1, in hundredths). */
const chanceVar = (id: string, symbol: string, name: string) => ({
  id,
  symbol,
  name,
  min: 0,
  max: 1,
  step: 0.01,
});
/** A probability the rules work out. */
const chanceOut = (id: string, symbol: string, name: string) => ({
  id,
  symbol,
  name,
  min: 0,
  max: 1,
  derived: true,
});

const H21_MODULES: ModuleDef[] = [
  page({
    id: 'g.m10-conditional-probability-tree',
    title: 'Probability tree: conditional branches',
    use: 'Use this for P(A and B) = P(A) × P(B | A), and for P(B) added over every path.',
    assumptions: [
      'The first branches are P(Rain) and P(Dry); they add to 1.',
      'Each second branch is conditional: P(Late | Rain) is the chance of being late when it rains.',
      'Multiply along a path; add the paths that end in Late for P(Late).',
    ],
    variables: [
      chanceVar('r', 'P(R)', 'P(Rain)'),
      chanceVar('a', 'P(L | R)', 'P(Late | Rain)'),
      chanceVar('b', 'P(L | D)', 'P(Late | Dry)'),
      chanceOut('j', 'P(R and L)', 'P(Rain and Late)'),
      chanceOut('t', 'P(L)', 'P(Late)'),
    ],
    rules: [
      rule(
        'P(R and L) = P(R) × P(L | R)',
        '{j} = {r} × {a}',
        ['j', 'r', 'a'],
        (v) => v.j! - v.r! * v.a!,
        {
          j: [(v) => v.r! * v.a!, '{r} × {a}', 'Multiply along the path: rain, then late.'],
          a: [(v) => div(v.j!, v.r!), '{j} ÷ {r}', 'Divide the path by the first branch.'],
        },
      ),
      rule(
        'P(L) = P(R)P(L | R) + (1 − P(R))P(L | D)',
        '{t} = {r} × {a} + (1 − {r}) × {b}',
        ['t', 'r', 'a', 'b'],
        (v) => v.t! - (v.r! * v.a! + (1 - v.r!) * v.b!),
        {
          t: [
            (v) => v.r! * v.a! + (1 - v.r!) * v.b!,
            '{r} × {a} + (1 − {r}) × {b}',
            'Add the two paths that end in Late: rain then late, and dry then late.',
          ],
        },
      ),
    ],
    example: { r: 0.3, a: 0.4, b: 0.1, j: 0.12, t: 0.19 },
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
    id: 'g.m10-probability-rules-without-replacement',
    title: 'Two draws without replacement',
    use: 'Use this for two draws without putting the first back: the second branch changes.',
    assumptions: [
      'The first draw is red with chance r ÷ n.',
      'Without replacement, one marble is gone: after a red, r − 1 reds are left of n − 1.',
      'Multiply along the path for P(Red, then Red).',
    ],
    variables: [
      { ...count('rd', 'Red marbles'), symbol: 'r', min: 1, max: 20 },
      { ...count('n', 'Marbles in all'), symbol: 'n', min: 2, max: 40 },
      chanceOut('p1', 'P(R)', 'P(Red first)'),
      chanceOut('p2', 'P(R | R)', 'P(Red second | Red first)'),
      chanceOut('p3', 'P(R | B)', 'P(Red second | Blue first)'),
      chanceOut('pp', 'P(R, R)', 'P(Red, then Red)'),
    ],
    rules: [
      rule('P(R) = r ÷ n', '{p1} = {rd} ÷ {n}', ['p1', 'rd', 'n'], (v) => v.p1! * v.n! - v.rd!, {
        p1: [(v) => div(v.rd!, v.n!), '{rd} ÷ {n}', 'Reds out of all the marbles.'],
      }),
      rule(
        'P(R | R) = (r − 1) ÷ (n − 1)',
        '{p2} = ({rd} − 1) ÷ ({n} − 1)',
        ['p2', 'rd', 'n'],
        (v) => v.p2! * (v.n! - 1) - (v.rd! - 1),
        {
          p2: [
            (v) => div(v.rd! - 1, v.n! - 1),
            '({rd} − 1) ÷ ({n} − 1)',
            'One red and one marble fewer after a red.',
          ],
        },
      ),
      rule(
        'P(R | B) = r ÷ (n − 1)',
        '{p3} = {rd} ÷ ({n} − 1)',
        ['p3', 'rd', 'n'],
        (v) => v.p3! * (v.n! - 1) - v.rd!,
        {
          p3: [(v) => div(v.rd!, v.n! - 1), '{rd} ÷ ({n} − 1)', 'Every red is left after a blue.'],
        },
      ),
      rule(
        'P(R, R) = P(R) × P(R | R)',
        '{pp} = {p1} × {p2}',
        ['pp', 'p1', 'p2'],
        (v) => v.pp! - v.p1! * v.p2!,
        {
          pp: [(v) => v.p1! * v.p2!, '{p1} × {p2}', 'Multiply along the path.'],
        },
      ),
    ],
    example: { rd: 3, n: 8, p1: 3 / 8, p2: 2 / 7, p3: 3 / 7, pp: 3 / 28 },
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
  // The edge: three first outcomes, and a second stage that does not depend on them.
  page({
    id: 'g.m10-conditional-probability-independent',
    title: 'Independent stages on a tree',
    use: 'Use this for checking independence: P(B | A) is the same on every first branch.',
    assumptions: [
      'The spinner lands on red, blue or green; its three chances add to 1.',
      'The coin’s chance of heads is the same whatever the spinner shows: independent.',
      'Then P(Blue and Heads) = P(Blue) × P(Heads).',
    ],
    variables: [
      chanceVar('r', 'P(R)', 'P(Red)'),
      chanceVar('u', 'P(U)', 'P(Blue)'),
      chanceOut('g', 'P(G)', 'P(Green)'),
      chanceVar('h', 'P(H)', 'P(Heads)'),
      chanceOut('j', 'P(U and H)', 'P(Blue and Heads)'),
    ],
    rules: [
      rule(
        'P(G) = 1 − P(R) − P(U)',
        '{g} = 1 − {r} − {u}',
        ['g', 'r', 'u'],
        (v) => v.g! - (1 - v.r! - v.u!),
        {
          g: [
            (v) => (1 - v.r! - v.u! >= -1e-9 ? 1 - v.r! - v.u! : undefined),
            '1 − {r} − {u}',
            'The three chances add to 1.',
          ],
        },
      ),
      rule(
        'P(U and H) = P(U) × P(H)',
        '{j} = {u} × {h}',
        ['j', 'u', 'h'],
        (v) => v.j! - v.u! * v.h!,
        {
          j: [(v) => v.u! * v.h!, '{u} × {h}', 'Independent: multiply the two chances.'],
        },
      ),
    ],
    example: { r: 0.5, u: 0.3, g: 0.2, h: 0.5, j: 0.15 },
    startWith: ['r', 'u', 'h'],
    representation: {
      kind: 'treeDiagram',
      chances: {
        first: ['r', 'u'],
        second: [['h'], ['h'], ['h']],
        names: [
          ['Red', 'Blue', 'Green'],
          ['Heads', 'Tails'],
        ],
        stages: ['Spinner', 'Coin'],
        path: [1, 0],
        chance: 'j',
      },
    },
  }),
];

// ── H22: Venn diagrams of probabilities ──

/** A constraint between probabilities (no solving): the diagram can only be drawn if it holds. */
const fitsRule = (id: string, display: string, vars: string[], ok: (v: Values) => boolean) => ({
  relation: {
    id,
    constraint: true as const,
    display,
    vars,
    residual: (v: Values) => (ok(v) ? 0 : 1),
    solve: {},
  },
  steps: {},
});

/** The probabilities fit one diagram: the overlap is in both, and nothing adds past 1. */
const vennFits = (exclusive: boolean) =>
  exclusive
    ? [
        fitsRule(
          'P(A) + P(B) ≤ 1',
          '{a} + {b} is at most 1',
          ['a', 'b'],
          (v) => v.a! + v.b! <= 1 + 1e-9,
        ),
      ]
    : [
        fitsRule(
          'P(A ∩ B) ≤ P(A)',
          '{ab} is at most {a}',
          ['ab', 'a'],
          (v) => v.ab! <= v.a! + 1e-9,
        ),
        fitsRule(
          'P(A ∩ B) ≤ P(B)',
          '{ab} is at most {b}',
          ['ab', 'b'],
          (v) => v.ab! <= v.b! + 1e-9,
        ),
        fitsRule(
          'P(A ∪ B) ≤ 1',
          '{a} + {b} − {ab} is at most 1',
          ['a', 'b', 'ab'],
          (v) => v.a! + v.b! - v.ab! <= 1 + 1e-9,
        ),
      ];

/** P(A), P(B), P(A and B) and one shaded probability worked from them. */
function vennPage(
  id: string,
  title: string,
  use: string,
  assumptions: string[],
  names: [string, string],
  shade: 'and' | 'or' | 'notA' | 'aOnly' | 'neither',
  result: {
    symbol: string;
    name: string;
    display: string;
    fn: (v: Values) => number;
    expr: string;
    how: string;
    vars: string[];
  },
  example: Values,
  exclusive = false,
): ModuleDef {
  return page({
    id,
    title,
    use,
    assumptions,
    variables: [
      chanceVar('a', `P(${names[0]})`, `P(${names[0]})`),
      chanceVar('b', `P(${names[1]})`, `P(${names[1]})`),
      ...(exclusive
        ? []
        : [chanceVar('ab', `P(${names[0]} ∩ ${names[1]})`, `P(${names[0]} and ${names[1]})`)]),
      chanceOut('s', result.symbol, result.name),
    ],
    rules: [
      ...vennFits(exclusive),
      rule(
        result.display.replace(/[{}]/g, ''),
        result.display,
        ['s', ...result.vars],
        (v) => v.s! - result.fn(v),
        {
          s: [
            (v) => {
              const x = result.fn(v);
              return x >= -1e-9 && x <= 1 + 1e-9 ? x : undefined;
            },
            result.expr,
            result.how,
          ],
        },
      ),
    ],
    example,
    startWith: exclusive ? ['a', 'b'] : ['a', 'b', 'ab'],
    representation: {
      kind: 'venn',
      chances: {
        a: 'a',
        b: 'b',
        both: exclusive ? 0 : 'ab',
        names,
        shade,
        ...(exclusive ? { exclusive: true } : {}),
        result: 's',
      },
    },
  });
}

const H22_MODULES: ModuleDef[] = [
  vennPage(
    'g.m10-probability-rules-union',
    'The addition rule on a Venn diagram',
    'Use this for P(A or B) = P(A) + P(B) − P(A and B).',
    [
      'P(A) and P(B) both count the overlap, so it is taken off once.',
      'Each region shows its own probability; the whole rectangle is 1.',
      'The shaded union is every outcome in A, in B or in both.',
    ],
    ['Band', 'Sport'],
    'or',
    {
      symbol: 'P(Band ∪ Sport)',
      name: 'P(Band or Sport)',
      display: '{s} = {a} + {b} − {ab}',
      fn: (v) => v.a! + v.b! - v.ab!,
      expr: '{a} + {b} − {ab}',
      how: 'Add the two, then take off the overlap counted twice.',
      vars: ['a', 'b', 'ab'],
    },
    { a: 0.3, b: 0.45, ab: 0.15, s: 0.6 },
  ),
  vennPage(
    'g.m10-probability-rules-exclusive',
    'Mutually exclusive events',
    'Use this for P(A or B) = P(A) + P(B) when A and B cannot happen together.',
    [
      'Mutually exclusive events share no outcome: P(A and B) = 0.',
      'Their circles do not overlap, so nothing is counted twice.',
      'The shaded union is just the two added.',
    ],
    ['Rolls 1', 'Rolls 6'],
    'or',
    {
      symbol: 'P(1 ∪ 6)',
      name: 'P(Rolls 1 or 6)',
      display: '{s} = {a} + {b}',
      fn: (v) => v.a! + v.b!,
      expr: '{a} + {b}',
      how: 'Nothing is shared, so just add the two.',
      vars: ['a', 'b'],
    },
    { a: 1 / 6, b: 1 / 6, s: 1 / 3 },
    true,
  ),
  vennPage(
    'g.m10-probability-rules-complement',
    'The complement rule',
    'Use this for P(not A) = 1 − P(A).',
    [
      'Everything outside A is the complement of A, written A′ or “not A”.',
      'A and not A together fill the rectangle, whose probability is 1.',
      'So the shaded part is 1 − P(A).',
    ],
    ['Rain', 'Wind'],
    'notA',
    {
      symbol: 'P(not Rain)',
      name: 'P(not Rain)',
      display: '{s} = 1 − {a}',
      fn: (v) => 1 - v.a!,
      expr: '1 − {a}',
      how: 'Everything outside A: take P(A) from 1.',
      vars: ['a'],
    },
    { a: 0.35, b: 0.4, ab: 0.2, s: 0.65 },
  ),
  vennPage(
    'g.m10-conditional-probability-venn',
    'Conditional probability on a Venn diagram',
    'Use this for P(A and B) from a Venn diagram, and P(B | A) = P(A and B) ÷ P(A).',
    [
      'The overlap is the outcomes in both A and B.',
      'Given A, only the A circle counts: P(B | A) = P(A and B) ÷ P(A).',
      'The caption works P(B | A) from the shaded overlap.',
    ],
    ['Math club', 'Science club'],
    'and',
    {
      symbol: 'P(M ∩ S)',
      name: 'P(Math club and Science club)',
      display: '{s} = {ab}',
      fn: (v) => v.ab!,
      expr: '{ab}',
      how: 'The overlap is the probability of both.',
      vars: ['ab'],
    },
    { a: 0.4, b: 0.3, ab: 0.12, s: 0.12 },
  ),
  // The edge: the region outside both circles.
  vennPage(
    'g.m10-probability-rules-neither',
    'Neither event',
    'Use this for P(neither A nor B) = 1 − P(A or B).',
    [
      'Outside both circles is neither A nor B.',
      'First find P(A or B) by the addition rule.',
      'Then the rest of the rectangle is 1 − P(A or B).',
    ],
    ['Cat', 'Dog'],
    'neither',
    {
      symbol: 'P(neither)',
      name: 'P(neither)',
      display: '{s} = 1 − ({a} + {b} − {ab})',
      fn: (v) => 1 - (v.a! + v.b! - v.ab!),
      expr: '1 − ({a} + {b} − {ab})',
      how: 'Everything outside the union: take P(A or B) from 1.',
      vars: ['a', 'b', 'ab'],
    },
    { a: 0.35, b: 0.5, ab: 0.15, s: 0.3 },
  ),
];

export const HSE_GALLERY_MODULES: ModuleDef[] = [
  ...H16_MODULES,
  ...H17_MODULES,
  ...H18_MODULES,
  ...H19_MODULES,
  ...H20_MODULES,
  ...H21_MODULES,
  ...H22_MODULES,
];
export const HSE_GALLERY_LAYOUTS: LayoutDef[] = [];
