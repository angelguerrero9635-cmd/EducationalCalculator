/**
 * Grades 9–12 gallery demos (group HE; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 *
 * H16 `lineSystem` / `linearFunction` shading and elimination's sum line.
 */
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

export const HSE_GALLERY_MODULES: ModuleDef[] = [...H16_MODULES, ...H17_MODULES];
export const HSE_GALLERY_LAYOUTS: LayoutDef[] = [];
