/**
 * Grades 9–12 round 2 gallery demos (group H2B: geometry (H96); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation, StepText } from './types';

type Solve = (v: Values) => number | undefined;
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

/** A value with a range. */
const V = (
  id: string,
  symbol: string,
  name: string,
  min: number,
  max: number,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, min, max, ...extra });
/** An angle in degrees. */
const deg = (id: string, symbol: string, name: string, min = 0.1, max = 179.9) =>
  V(id, symbol, name, min, max, { unit: '°' });

/** One relation with its step text: for each value it is solved for, [solve, expr, how]. */
function rule(
  id: string,
  display: string,
  solve: Record<string, [Solve, string, string]>,
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
function demo(d: {
  id: string;
  title: string;
  use: string;
  assumptions: string[];
  variables: VariableDef[];
  rules: Rule[];
  example: Values;
  startWith: string[];
  representation: Representation;
  equation?: string;
}): ModuleDef {
  return {
    id: d.id,
    title: d.title,
    use: d.use,
    assumptions: d.assumptions,
    variables: d.variables,
    relations: d.rules.map((r) => r.relation),
    steps: Object.fromEntries(d.rules.map((r) => [r.relation.id, r.steps])),
    example: d.example,
    startWith: d.startWith,
    representation: d.representation,
    ...(d.equation ? { equation: d.equation } : {}),
  };
}

// ─── Part 1: a regular polygon (m.10.quadrilaterals main) ─────────────────────

const polygonSums = (id: string, title: string, use: string, n: number, start: string[]) =>
  demo({
    id,
    title,
    use,
    assumptions: [
      'The diagonals from one corner cut a convex polygon with n sides into n − 2 triangles.',
      'Each triangle’s angles add to 180°, so the interior angles add to (n − 2) × 180°.',
      'A regular polygon’s angles are equal: each is the sum ÷ n. Its exterior angles add to 360°, so each is 360° ÷ n.',
    ],
    variables: [
      V('n', 'n', 'Number of sides', 3, 30, { step: 1, integer: true }),
      V('S', 'S', 'Sum of the interior angles', 180, 5040, { unit: '°', step: 1 }),
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
    example: { n, S: (n - 2) * 180, e: ((n - 2) * 180) / n, x: 360 / n },
    startWith: start,
    representation: {
      kind: 'markedFigure',
      regular: {
        sides: 'n',
        triangles: true,
        exterior: true,
        labels: { sum: 'S', interior: 'e', exterior: 'x' },
      },
    },
  });

const REGULAR: ModuleDef[] = [
  polygonSums(
    'g.m10-quadrilaterals-polygon-sums',
    'Polygon angle sums',
    'Use this for “Find the sum of the interior angles of a 9-gon, and each angle if it is regular.”',
    9,
    ['n'],
  ),
  polygonSums(
    'g.m10-quadrilaterals-polygon-sums-30',
    'Sides from an exterior angle',
    'Use this for “Each exterior angle of a regular polygon is 12°. How many sides has it?”',
    30,
    ['x'],
  ),
];

// ─── Part 2: circleTheorems cyclic and arcAngle (m.10.circle-theorems) ────────

/** x + y = 180°, solved for either. */
const supplement = (x: string, y: string, how: string) =>
  rule(
    `${x} + ${y} = 180`,
    `{${x}} + {${y}} = 180`,
    {
      [x]: [(v) => 180 - v[y]!, `180 − {${y}}`, how],
      [y]: [(v) => 180 - v[x]!, `180 − {${x}}`, how],
    },
    (v) => v[x]! + v[y]! - 180,
  );

const cyclicDemo = (id: string, title: string, use: string, a: number) =>
  demo({
    id,
    title,
    use,
    assumptions: [
      'ABCD is inscribed: all four corners are on the circle.',
      'Each angle is half the arc across from it; the arcs across from A and from C make the whole circle.',
      'So opposite angles add to 180°: m∠A + m∠C = 180° and m∠B + m∠D = 180°.',
    ],
    variables: [deg('a', 'a', 'm∠A'), deg('c', 'c', 'm∠C')],
    rules: [supplement('a', 'c', 'Opposite angles of an inscribed quadrilateral add to 180°.')],
    example: { a, c: 180 - a },
    startWith: ['a'],
    representation: {
      kind: 'circleTheorems',
      theorem: 'cyclic',
      cyclic: { A: 'a', C: 'c' },
    },
  });

/** x = (p ± q) ÷ 2, the sign from the + − box o (1 +, 2 −). */
// 3 − 2o: 1 for + (o = 1), −1 for − (o = 2); a product, so the solver never reads the
// relation as a straight-line sum while o is still open.
const sgn = (v: Values) => 3 - 2 * v.o!;
const op = (v: Values) => (v.o === 2 ? '−' : '+');
const arcAngleRule: Rule = {
  relation: {
    id: 'x = (p ± q)/2',
    display: '{x} = ({p} + (3 − 2 × {o}) × {q}) ÷ 2',
    vars: ['x', 'p', 'q', 'o'],
    residual: (v) => 2 * v.x! - (v.p! + sgn(v) * v.q!),
    solve: {
      x: (v) => (v.p! + sgn(v) * v.q!) / 2,
      p: (v) => 2 * v.x! - sgn(v) * v.q!,
      q: (v) => sgn(v) * (2 * v.x! - v.p!),
      // The + − box is typed, never worked out.
      o: () => undefined,
    },
  },
  steps: {
    x: {
      expr: (v: Values) => `({p} ${op(v)} {q}) ÷ 2`,
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
const arcAngleDemo = (
  id: string,
  title: string,
  use: string,
  ex: { p: number; q: number; o: 1 | 2 },
) =>
  demo({
    id,
    title,
    use,
    assumptions: [
      'Two chords crossing inside the circle (+): the angle is half the sum of its arc and its vertical angle’s arc.',
      'Two secants meeting outside (−): the angle is half the far arc minus the near arc.',
      'p is arc AC inside, or the far arc outside; q is the other arc.',
    ],
    variables: [
      deg('p', 'p', 'First arc (far arc outside)', 0.1, 359.9),
      deg('q', 'q', 'Second arc (near arc outside)', 0.1, 359.9),
      V('o', 'o', 'Inside (1, +) or outside (2, −)', 1, 2, { allowed: [1, 2], integer: true }),
      deg('x', 'x', 'The angle'),
    ],
    rules: [arcAngleRule],
    example: { ...ex, x: (ex.p + (ex.o === 2 ? -1 : 1) * ex.q) / 2 },
    startWith: ['p', 'o', 'q'],
    equation: '{x}° = ({p}° {o:op} {q}°) ÷ 2',
    representation: {
      kind: 'circleTheorems',
      theorem: 'arcAngle',
      arcAngle: { arcs: ['p', 'q'], angle: 'x', where: 'o' },
    },
  });

const CIRCLES: ModuleDef[] = [
  cyclicDemo(
    'g.m10-circle-theorems-cyclic-quadrilateral',
    'Opposite angles of an inscribed quadrilateral',
    'Use this for “ABCD is inscribed in a circle and m∠A = 84°. Find m∠C.”',
    84,
  ),
  cyclicDemo(
    'g.m10-circle-theorems-cyclic-narrow',
    'An inscribed quadrilateral with a narrow angle',
    'Use this for “ABCD is inscribed in a circle and m∠A = 15°. Find m∠C.”',
    15,
  ),
  arcAngleDemo(
    'g.m10-circle-theorems-chord-angle',
    'Angles from arcs',
    'Use this for “Two chords cross inside a circle, cutting off arcs of 70° and 110°. Find the angle.”',
    { p: 70, q: 110, o: 1 },
  ),
  arcAngleDemo(
    'g.m10-circle-theorems-chord-angle-outside',
    'An angle outside a circle from its arcs',
    'Use this for “Two secants from P cut off arcs of 140° and 50°. Find the angle at P.”',
    { p: 140, q: 50, o: 2 },
  ),
];

// ─── Part 3: coordinatePlane sized to the points (m.10.coordinate-geometry) ────

const distanceRule: Rule = {
  relation: {
    id: 'd = √((x₂ − x₁)² + (y₂ − y₁)²)',
    display: '{d} = √(({x2} − {x1})² + ({y2} − {y1})²)',
    vars: ['d', 'x1', 'y1', 'x2', 'y2'],
    residual: (v) => v.d! - Math.hypot(v.x2! - v.x1!, v.y2! - v.y1!),
    solve: {
      d: (v) => Math.hypot(v.x2! - v.x1!, v.y2! - v.y1!),
      x1: () => undefined,
      y1: () => undefined,
      x2: () => undefined,
      y2: () => undefined,
    },
  },
  steps: {
    d: {
      expr: '√(({x2} − {x1})² + ({y2} − {y1})²)',
      how: 'The distance formula: the change across and the change up are the legs of a right triangle.',
    },
  },
};
const coord = (id: string, symbol: string, name: string) =>
  V(id, symbol, name, -20, 20, { step: 0.5 });
const fitDemo = (
  id: string,
  title: string,
  use: string,
  ex: { x1: number; y1: number; x2: number; y2: number },
) =>
  demo({
    id,
    title,
    use,
    assumptions: [
      'The segment AB is the hypotenuse of a right triangle whose legs go straight across and straight up.',
      'The legs are x₂ − x₁ and y₂ − y₁, so d = √((x₂ − x₁)² + (y₂ − y₁)²).',
      'The grid is sized to the points: 5, 10 or 20 squares each way from the origin.',
    ],
    variables: [
      coord('x1', 'x₁', 'x of A'),
      coord('y1', 'y₁', 'y of A'),
      coord('x2', 'x₂', 'x of B'),
      coord('y2', 'y₂', 'y of B'),
      V('d', 'd', 'Distance AB', 0, 60, { derived: true }),
    ],
    rules: [distanceRule],
    example: { ...ex, d: Math.hypot(ex.x2 - ex.x1, ex.y2 - ex.y1) },
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
  });

const PLANES: ModuleDef[] = [
  fitDemo(
    'g.m10-coordinate-geometry-fit',
    'Distance on a grid sized to the points',
    'Use this for “Find the distance from (−3, 2) to (5, 8).”',
    { x1: -3, y1: 2, x2: 5, y2: 8 },
  ),
  fitDemo(
    'g.m10-coordinate-geometry-fit-small',
    'Distance between two close points',
    'Use this for “Find the distance from (−3, 1) to (1, 4).”',
    { x1: -3, y1: 1, x2: 1, y2: 4 },
  ),
  fitDemo(
    'g.m10-coordinate-geometry-fit-20',
    'Distance between two far points',
    'Use this for “Find the distance from (−18, −12) to (16, 20).”',
    { x1: -18, y1: -12, x2: 16, y2: 20 },
  ),
];

// ─── Part 4: symmetry about a center off the origin (m.10.rigid-motions~symmetry) ─

/** x = f(v), read off the figure (no inverse): a value picked by the others. */
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
/** x = e (a sum or half-sum of the other values), worked out only. */
const derive = (
  x: string,
  display: string,
  f: (v: Values) => number,
  expr: string,
  how: string,
) => {
  const vars = [...new Set([...display.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!))];
  return {
    relation: {
      id: display.replace(/[{}]/g, ''),
      display,
      vars,
      residual: (v: Values) => v[x]! - f(v),
      solve: Object.fromEntries(vars.map((k) => [k, k === x ? f : () => undefined])),
    },
    steps: { [x]: { expr, how } },
  } as Rule;
};

const SYMMETRY: ModuleDef[] = [
  demo({
    id: 'g.m10-rigid-motions-symmetry-parallelogram',
    title: 'Turns that carry a parallelogram onto itself',
    use: 'Use this for “Which rotations about its center carry a parallelogram onto itself?”',
    assumptions: [
      'The parallelogram has corners (1, 1), (r, 1), (p, u) and (3, u): the top is the base slid 2 to the right.',
      'Its center (a, b) is where the diagonals cross: halfway from (1, 1) to (p, u).',
      'A half turn about the center swaps opposite corners, so 180° and 360° carry it onto itself; it has no line of symmetry.',
    ],
    variables: [
      V('w', 'w', 'Base', 2, 6, { step: 1, integer: true }),
      V('h', 'h', 'Height', 1, 7, { step: 1, integer: true }),
      V('t', 't', 'Turn', 90, 360, { unit: '°', allowed: [90, 180, 270, 360] }),
      V('r', 'r', 'x of the second corner', 3, 7, { integer: true, derived: true }),
      V('u', 'u', 'Top side at y =', 2, 8, { integer: true, derived: true }),
      V('p', 'p', 'x of the third corner', 5, 9, { integer: true, derived: true }),
      V('a', 'a', 'x of the center', 3, 5, { derived: true }),
      V('b', 'b', 'y of the center', 1.5, 4.5, { derived: true }),
      V('n', 'n', 'Order of rotational symmetry', 2, 2, { integer: true, derived: true }),
      V('f', 'f', 'Carried onto itself (1 yes, 0 no)', 0, 1, { integer: true, derived: true }),
    ],
    rules: [
      derive(
        'r',
        '{r} = 1 + {w}',
        (v) => 1 + v.w!,
        '1 + {w}',
        'The base runs w squares from x = 1.',
      ),
      derive('u', '{u} = 1 + {h}', (v) => 1 + v.h!, '1 + {h}', 'The top is h squares above y = 1.'),
      derive('p', '{p} = {r} + 2', (v) => v.r! + 2, '{r} + 2', 'The top is the base slid 2 right.'),
      derive(
        'a',
        '{a} = (1 + {p}) ÷ 2',
        (v) => (1 + v.p!) / 2,
        '(1 + {p}) ÷ 2',
        'The diagonals cross halfway across.',
      ),
      derive(
        'b',
        '{b} = (1 + {u}) ÷ 2',
        (v) => (1 + v.u!) / 2,
        '(1 + {u}) ÷ 2',
        'The diagonals cross halfway up.',
      ),
      pick(
        'n from w and h',
        'order {n} when the sides are {w} and {h}',
        'n',
        // Any slanted parallelogram (never a rectangle here: the top is slid 2 across).
        (v) => (v.w! > 0 && v.h! > 0 ? 2 : 1),
        () => 'A slanted parallelogram lands on itself every half turn, and on no smaller turn.',
      ),
      pick(
        'f from t and n',
        '{f}: does a turn of {t} carry it onto itself, order {n}',
        'f',
        (v) => (Math.round(v.t! * v.n!) % 360 === 0 ? 1 : 0),
        (v) =>
          Math.round(v.t! * v.n!) % 360 === 0
            ? 'The turn is a whole number of half turns: the figure lands on itself.'
            : 'The turn is not a whole number of half turns: the figure lands turned.',
      ),
    ],
    example: { w: 4, h: 4, t: 180, r: 5, u: 5, p: 7, a: 4, b: 3, n: 2, f: 1 },
    startWith: ['w', 'h', 't'],
    representation: {
      kind: 'transformation',
      figure: [
        [1, 1],
        ['r', 1],
        ['p', 'u'],
        [3, 'u'],
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

export const HS2B_GALLERY_MODULES: ModuleDef[] = [...REGULAR, ...CIRCLES, ...PLANES, ...SYMMETRY];

// ─── Part 5: marked-triangle cards (m.10.congruence, m.10.similarity~similar-or-not) ─

type Sides = [number, number, number];
const RAD = Math.PI / 180;
/** Side BC from AB = c, CA = b and the angle A between them (law of cosines). */
const opposite = (A: number, b: number, c: number) =>
  Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(A * RAD));
/**
 * The two triangles SSA allows: angle A, AB = c and BC = a (shorter than c) fit two lengths of
 * CA, so two different triangles share those three parts.
 */
const ssa = (A: number, c: number, a: number): [Sides, Sides] => {
  const along = c * Math.cos(A * RAD);
  const r = Math.sqrt(a * a - (c * Math.sin(A * RAD)) ** 2);
  return [
    [a, along + r, c],
    [a, along - r, c],
  ];
};
const [ssaLong, ssaShort] = ssa(40, 5, 4);
const scaled = (t: Sides, k: number): Sides => [t[0] * k, t[1] * k, t[2] * k];

const CONGRUENCE_CARDS: LayoutDef = {
  kind: 'sort',
  id: 'g.m10-congruence-marked',
  title: 'Which test proves the triangles congruent?',
  use: 'Use this for “Which test proves △ABC ≅ △DEF from the marks?”',
  assumptions: [
    'Tick marks with the same count are equal sides; arcs with the same count are equal angles.',
    'SSS, SAS, ASA and AAS each prove two triangles congruent; HL does for right triangles.',
    'SSA and AAA don’t: two different triangles can match those parts.',
  ],
  question: 'Which test proves △ABC ≅ △DEF?',
  bins: [
    { id: 'sss', label: 'SSS', why: 'Three pairs of sides are congruent.' },
    { id: 'sas', label: 'SAS', why: 'Two sides and the angle between them.' },
    { id: 'asa', label: 'ASA', why: 'Two angles and the side between them.' },
    { id: 'aas', label: 'AAS', why: 'Two angles and a side not between them.' },
    { id: 'hl', label: 'HL', why: 'Right triangles with the hypotenuse and a leg congruent.' },
    { id: 'none', label: 'Not enough', why: 'Two different triangles fit these parts.' },
  ],
  cards: [
    {
      label: 'AB = DE, BC = EF, CA = FD',
      bin: 'sss',
      figure: {
        kind: 'markedTriangles',
        triangles: [
          [6, 5, 4],
          [6, 5, 4],
        ],
        mirror: true,
        ticks: { a: 1, b: 2, c: 3 },
      },
    },
    {
      label: 'AB = DE, m∠B = m∠E, BC = EF',
      bin: 'sas',
      figure: {
        kind: 'markedTriangles',
        triangles: [
          [6, 5, 4],
          [6, 5, 4],
        ],
        mirror: true,
        ticks: { c: 1, a: 2 },
        arcs: { B: 1 },
      },
    },
    {
      label: 'm∠A = m∠D, AB = DE, m∠B = m∠E',
      bin: 'asa',
      figure: {
        kind: 'markedTriangles',
        triangles: [
          [5, 6, 4],
          [5, 6, 4],
        ],
        mirror: true,
        ticks: { c: 1 },
        arcs: { A: 1, B: 2 },
      },
    },
    {
      label: 'm∠A = m∠D, m∠B = m∠E, BC = EF',
      bin: 'aas',
      figure: {
        kind: 'markedTriangles',
        triangles: [
          [5, 6, 4],
          [5, 6, 4],
        ],
        mirror: true,
        ticks: { a: 1 },
        arcs: { A: 1, B: 2 },
      },
    },
    {
      label: 'Right angles at C and F, AB = DE, AC = DF',
      bin: 'hl',
      figure: {
        kind: 'markedTriangles',
        triangles: [
          [3, 4, 5],
          [3, 4, 5],
        ],
        mirror: true,
        right: ['C'],
        ticks: { c: 1, b: 2 },
      },
    },
    {
      label: 'AB = DE, BC = EF, m∠A = m∠D',
      bin: 'none',
      figure: {
        kind: 'markedTriangles',
        triangles: [ssaLong, ssaShort],
        ticks: { c: 1, a: 2 },
        arcs: { A: 1 },
      },
    },
    {
      label: 'All three angles equal',
      bin: 'none',
      figure: {
        kind: 'markedTriangles',
        triangles: [
          [4, 5, 6],
          [6, 7.5, 9],
        ],
        arcs: { A: 1, B: 2, C: 3 },
      },
    },
  ],
};

const sasFirst: Sides = [opposite(50, 6, 8), 6, 8];

const SIMILARITY_CARDS: LayoutDef = {
  kind: 'sort',
  id: 'g.m10-similarity-marked',
  title: 'Similar, and by which test?',
  use: 'Use this for “Which pairs of triangles must be similar, and why?”',
  assumptions: [
    'AA: two pairs of equal angles. SSS: all three side ratios equal.',
    'SAS: two side ratios equal and the angles between those sides equal.',
    'Arcs with the same count are equal angles; the numbers are side lengths.',
  ],
  question: 'Must the triangles be similar? By which test?',
  bins: [
    { id: 'aa', label: 'Similar by AA', why: 'Two pairs of equal angles fix the third pair too.' },
    {
      id: 'sss',
      label: 'Similar by SSS',
      why: 'Every side of one is the same multiple of its match.',
    },
    {
      id: 'sas',
      label: 'Similar by SAS',
      why: 'Two sides in the same ratio with equal angles between them.',
    },
    {
      id: 'not',
      label: 'Not always similar',
      why: 'The facts given fit triangles of different shapes.',
    },
  ],
  cards: [
    {
      label: 'm∠A = m∠D and m∠B = m∠E',
      bin: 'aa',
      figure: {
        kind: 'markedTriangles',
        triangles: [
          [4, 5, 6],
          [6, 7.5, 9],
        ],
        arcs: { A: 1, B: 2 },
      },
    },
    {
      label: 'Two equilateral triangles',
      bin: 'aa',
      figure: {
        kind: 'markedTriangles',
        triangles: [
          [3, 3, 3],
          [5, 5, 5],
        ],
        arcs: { A: 1, B: 1, C: 1 },
      },
    },
    {
      label: 'Sides 3, 4, 6 and 4.5, 6, 9',
      bin: 'sss',
      figure: {
        kind: 'markedTriangles',
        triangles: [
          [3, 4, 6],
          [4.5, 6, 9],
        ],
        lengths: true,
      },
    },
    {
      label: 'AB/DE = AC/DF = 2 and m∠A = m∠D',
      bin: 'sas',
      figure: {
        kind: 'markedTriangles',
        triangles: [sasFirst, scaled(sasFirst, 0.5)],
        lengths: ['b', 'c'],
        arcs: { A: 1 },
      },
    },
    {
      label: 'Two isosceles triangles',
      bin: 'not',
      figure: {
        kind: 'markedTriangles',
        triangles: [
          [5, 5, 3],
          [4, 6, 6],
        ],
      },
    },
    {
      label: 'Two right triangles',
      bin: 'not',
      figure: {
        kind: 'markedTriangles',
        triangles: [
          [3, 4, 5],
          [5, 12, 13],
        ],
        right: ['C'],
      },
    },
    {
      label: 'Sides 4, 6, 8 and 6, 9, 13',
      bin: 'not',
      figure: {
        kind: 'markedTriangles',
        triangles: [
          [4, 6, 8],
          [6, 9, 13],
        ],
        lengths: true,
      },
    },
    {
      label: 'AB/DE = BC/EF and m∠A = m∠D',
      bin: 'not',
      figure: {
        kind: 'markedTriangles',
        triangles: [ssaLong, scaled(ssaShort, 1.5)],
        arcs: { A: 1 },
      },
    },
  ],
};

export const HS2B_GALLERY_LAYOUTS: LayoutDef[] = [CONGRUENCE_CARDS, SIMILARITY_CARDS];
