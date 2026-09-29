/**
 * Grades 9–12 gallery demos (group HF; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

type Rel = { relation: Relation; steps: Record<string, StepText> };
type Solve = (v: Values) => number | undefined;

const V = (
  id: string,
  symbol: string,
  name: string,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...extra });

/** A whole-number coordinate from −lim to lim. */
const coord = (id: string, symbol: string, name: string, lim = 10) =>
  V(id, symbol, name, { min: -lim, max: lim, step: 1, integer: true });

/**
 * A relation with its solve functions and step text, one entry per variable (null: the
 * variable is in the relation but not worked out from it).
 */
function R(
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, string, string] | null>,
): Rel {
  const solved = Object.entries(parts).filter(
    (e): e is [string, [Solve, string, string]] => e[1] !== null,
  );
  return {
    relation: {
      id,
      display,
      vars: Object.keys(parts),
      residual,
      solve: Object.fromEntries(solved.map(([k, [f]]) => [k, f])),
    },
    steps: Object.fromEntries(solved.map(([k, [, expr, how]]) => [k, { expr, how }])),
  };
}

const rels = (...rs: Rel[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

/** b = a: a coordinate carried over unchanged (or with its sign changed, `sign` −1). */
const copy = (to: string, from: string, how: string, sign = 1): Rel =>
  R(
    sign === 1 ? `${to} = ${from}` : `${to} = −${from}`,
    sign === 1 ? `{${to}} = {${from}}` : `{${to}} = −{${from}}`,
    (v) => v[to]! - sign * v[from]!,
    {
      [to]: [(v) => sign * v[from]!, sign === 1 ? `{${from}}` : `−{${from}}`, how],
      [from]: [(v) => sign * v[to]!, sign === 1 ? `{${to}}` : `−{${to}}`, how],
    },
  );

/** c = a + b. */
const sum = (c: string, a: string, b: string, how: string): Rel =>
  R(`${c} = ${a} + ${b}`, `{${c}} = {${a}} + {${b}}`, (v) => v[c]! - v[a]! - v[b]!, {
    [c]: [(v) => v[a]! + v[b]!, `{${a}} + {${b}}`, how],
    [a]: [(v) => v[c]! - v[b]!, `{${c}} − {${b}}`, how],
    [b]: [(v) => v[c]! - v[a]!, `{${c}} − {${a}}`, how],
  });

// ── H23 transformation: two moves, any line or center, symmetry ──

const composeReflectRotate: ModuleDef = {
  id: 'g.m10-rigid-motions-compose',
  title: 'Two moves: reflect, then rotate',
  use: 'Use this for “Reflect the triangle across the y-axis, then rotate it 90° about the origin. Where does A end up?”',
  assumptions: [
    'First reflect across the y-axis: (x, y) → (−x, y).',
    'Then rotate 90° counterclockwise about the origin: (x, y) → (−y, x).',
    'A′ is the middle image; A″ is where the two moves together take A.',
  ],
  standalone: {
    vars: ['ay', 'py', 'qx'],
    why: 'The reflection keeps y, and the turn sends that y to the new x on its own.',
  },
  variables: [
    coord('ax', 'x', 'x of A'),
    coord('ay', 'y', 'y of A'),
    coord('px', 'x′', 'x of A′'),
    coord('py', 'y′', 'y of A′'),
    coord('qx', 'x″', 'x of A″'),
    coord('qy', 'y″', 'y of A″'),
  ],
  ...rels(
    copy('px', 'ax', 'Reflecting across the y-axis changes the sign of x.', -1),
    copy('py', 'ay', 'Reflecting across the y-axis keeps y.'),
    copy(
      'qx',
      'py',
      'A quarter turn counterclockwise: the new x is the old y with its sign changed.',
      -1,
    ),
    copy('qy', 'px', 'A quarter turn counterclockwise: the new y is the old x.'),
  ),
  example: { ax: 2, ay: 4, px: -2, py: 4, qx: -4, qy: -2 },
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
};

const composeGlide: ModuleDef = {
  id: 'g.m10-rigid-motions-glide',
  title: 'Two moves: a glide reflection',
  use: 'Use this for “Translate the figure 6 units right, then reflect it across the x-axis.”',
  assumptions: [
    'First slide h units right: (x, y) → (x + h, y).',
    'Then reflect across the x-axis: (x, y) → (x, −y).',
    'A slide along a line followed by a flip in that line is a glide reflection.',
  ],
  standalone: {
    vars: ['ay', 'py', 'qy'],
    why: 'The slide is across, so the heights change only by the flip.',
  },
  variables: [
    coord('ax', 'x', 'x of A'),
    coord('ay', 'y', 'y of A'),
    coord('h', 'h', 'Slide right'),
    coord('px', 'x′', 'x of A′', 20),
    coord('py', 'y′', 'y of A′'),
    coord('qx', 'x″', 'x of A″', 20),
    coord('qy', 'y″', 'y of A″'),
  ],
  ...rels(
    sum('px', 'ax', 'h', 'The slide moves every point h units across.'),
    copy('py', 'ay', 'A slide across keeps y.'),
    copy('qx', 'px', 'Reflecting across the x-axis keeps x.'),
    copy('qy', 'py', 'Reflecting across the x-axis changes the sign of y.', -1),
  ),
  example: { ax: -6, ay: 2, h: 6, px: 0, py: 2, qx: 0, qy: -2 },
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
};

const rotateAboutPoint: ModuleDef = {
  id: 'g.m10-rigid-motions-rotate-point',
  title: 'Rotating about any point',
  use: 'Use this for “Rotate A(5, 1) 90° counterclockwise about the point (2, 3).”',
  assumptions: [
    'The turn is 90° counterclockwise about the center (a, b).',
    'Measure A from the center, turn that step a quarter turn, and add it back to the center.',
    'x′ = a − (y − b) and y′ = b + (x − a).',
  ],
  variables: [
    coord('ax', 'x', 'x of A'),
    coord('ay', 'y', 'y of A'),
    coord('a', 'a', 'x of the center'),
    coord('b', 'b', 'y of the center'),
    coord('px', 'x′', 'x of A′', 30),
    coord('py', 'y′', 'y of A′', 30),
  ],
  ...rels(
    R('x′ = a − (y − b)', '{px} = {a} − ({ay} − {b})', (v) => v.px! - (v.a! - v.ay! + v.b!), {
      px: [
        (v) => v.a! - v.ay! + v.b!,
        '{a} − ({ay} − {b})',
        'A quarter turn sends the step up from the center to a step left.',
      ],
      ay: [(v) => v.a! + v.b! - v.px!, '{a} + {b} − {px}', 'Undo the turn for the height of A.'],
      a: [(v) => v.px! + v.ay! - v.b!, '{px} + ({ay} − {b})', 'Undo the step left.'],
      b: [(v) => v.px! + v.ay! - v.a!, '{px} + {ay} − {a}', 'Undo the step left.'],
    }),
    R('y′ = b + (x − a)', '{py} = {b} + ({ax} − {a})', (v) => v.py! - (v.b! + v.ax! - v.a!), {
      py: [
        (v) => v.b! + v.ax! - v.a!,
        '{b} + ({ax} − {a})',
        'A quarter turn sends the step right from the center to a step up.',
      ],
      ax: [(v) => v.py! - v.b! + v.a!, '{a} + ({py} − {b})', 'Undo the turn for the x of A.'],
      a: [(v) => v.ax! + v.b! - v.py!, '{ax} + {b} − {py}', 'Undo the step up.'],
      b: [(v) => v.py! - v.ax! + v.a!, '{py} − ({ax} − {a})', 'Undo the step up.'],
    }),
  ),
  example: { ax: 5, ay: 1, a: 2, b: 3, px: 4, py: 6 },
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
};

const reflectAntiDiagonal: ModuleDef = {
  id: 'g.m10-rigid-motions-reflect-diagonal',
  title: 'Reflecting across y = −x',
  use: 'Use this for “Reflect the triangle across the line y = −x.”',
  assumptions: [
    'Reflecting across y = −x swaps the coordinates and changes both signs: (x, y) → (−y, −x).',
    'Each corner and its image are the same distance from the line, on a segment square to it.',
  ],
  standalone: {
    vars: ['ay', 'px'],
    why: 'The new x comes from the old y alone.',
  },
  variables: [
    coord('ax', 'x', 'x of A'),
    coord('ay', 'y', 'y of A'),
    coord('px', 'x′', 'x of A′'),
    coord('py', 'y′', 'y of A′'),
  ],
  ...rels(
    copy('px', 'ay', 'Across y = −x, the new x is the old y with its sign changed.', -1),
    copy('py', 'ax', 'Across y = −x, the new y is the old x with its sign changed.', -1),
  ),
  example: { ax: 1, ay: 4, px: -4, py: -1 },
  startWith: ['ax', 'ay'],
  representation: {
    kind: 'transformation',
    figure: [
      ['ax', 'ay'],
      [4, 4],
      [4, 2],
    ],
    move: 'reflect',
    mirror: 'y = −x',
    image: { x: 'px', y: 'py' },
    extent: 6,
  },
};

/** m = (1 + r)/2: the middle of 1 and r. */
const middle = (m: string, r: string, what: string): Rel =>
  R(`${m} = (1 + ${r})/2`, `{${m}} = (1 + {${r}}) ÷ 2`, (v) => 2 * v[m]! - 1 - v[r]!, {
    [m]: [(v) => (1 + v[r]!) / 2, `(1 + {${r}}) ÷ 2`, `The center is halfway ${what}.`],
    [r]: [(v) => 2 * v[m]! - 1, `2 × {${m}} − 1`, `The center is halfway ${what}.`],
  });

const symmetryRectangle: ModuleDef = {
  id: 'g.m10-rigid-motions-symmetry-rectangle',
  title: 'Symmetry of a rectangle',
  use: 'Use this for “Which rotations and reflections carry a 6 by 4 rectangle onto itself?”',
  assumptions: [
    'The rectangle has corners (1, 1), (r, 1), (r, t) and (1, t).',
    'Its center (a, b) is halfway across and halfway up; a half turn about it carries the rectangle onto itself.',
    'A rectangle that is not a square has 2 lines of symmetry; a square has 4.',
  ],
  standalone: { vars: ['t', 'cy'], why: 'The center’s height depends on the top alone.' },
  variables: [
    V('r', 'r', 'Right side at x =', { min: 2, max: 9, step: 1, integer: true }),
    V('t', 't', 'Top side at y =', { min: 2, max: 9, step: 1, integer: true }),
    V('cx', 'a', 'x of the center', { min: 1.5, max: 5, step: 0.5 }),
    V('cy', 'b', 'y of the center', { min: 1.5, max: 5, step: 0.5 }),
  ],
  ...rels(middle('cx', 'r', 'across'), middle('cy', 't', 'up')),
  example: { r: 7, t: 5, cx: 4, cy: 3 },
  startWith: ['r', 't'],
  representation: {
    kind: 'transformation',
    figure: [
      [1, 1],
      ['r', 1],
      ['r', 't'],
      [1, 't'],
    ],
    move: 'rotate',
    angle: 180,
    center: ['cx', 'cy'],
    symmetry: true,
    extent: 8,
    quadrants: 1,
  },
};

const symmetrySquare: ModuleDef = {
  id: 'g.m10-rigid-motions-symmetry-square',
  title: 'Turns that carry a square onto itself',
  use: 'Use this for “What is the smallest rotation that carries a square onto itself?”',
  assumptions: [
    'The square has corners (1, 1), (r, 1), (r, r) and (1, r); its center is (c, c).',
    'A turn of t° about the center lands the square on itself when t is a multiple of 90.',
    'n turns of t° make one full turn: n × t = 360.',
  ],
  standalone: { vars: ['t', 'n'], why: 'The number of turns depends on the angle alone.' },
  variables: [
    V('r', 'r', 'Right side at x =', { min: 2, max: 9, step: 1, integer: true }),
    V('c', 'c', 'Center coordinate', { min: 1.5, max: 5, step: 0.5 }),
    V('t', 't', 'Turn', { unit: '°', min: 1, max: 360, step: 1 }),
    V('n', 'n', 'Turns to go all the way round', { min: 1, max: 360, step: 0.01 }),
  ],
  ...rels(
    middle('c', 'r', 'along each side'),
    R('n × t = 360', '{n} × {t} = 360', (v) => v.n! * v.t! - 360, {
      n: [(v) => 360 / v.t!, '360 ÷ {t}', 'How many turns of t° make a full turn.'],
      t: [(v) => 360 / v.n!, '360 ÷ {n}', 'A full turn split into n equal turns.'],
    }),
  ),
  example: { r: 5, c: 3, t: 90, n: 4 },
  startWith: ['r', 't'],
  representation: {
    kind: 'transformation',
    figure: [
      [1, 1],
      ['r', 1],
      ['r', 'r'],
      [1, 'r'],
    ],
    move: 'rotate',
    angle: 't',
    center: ['c', 'c'],
    symmetry: true,
    extent: 6,
    quadrants: 1,
  },
};

const symmetryIsosceles: ModuleDef = {
  id: 'g.m10-rigid-motions-symmetry-isosceles',
  title: 'Symmetry of an isosceles triangle',
  use: 'Use this for “Which reflection carries an isosceles triangle onto itself? Does any rotation?”',
  assumptions: [
    'The triangle has its base from (1, 1) to (r, 1) and its top at (m, t), above the middle of the base.',
    'Reflecting across the line x = m carries it onto itself; no turn short of a full turn does.',
    'Its area is half the base r − 1 times the height t − 1.',
  ],
  variables: [
    V('r', 'r', 'Right end of the base at x =', { min: 3, max: 9, step: 2, integer: true }),
    V('m', 'm', 'Middle of the base', { min: 2, max: 5, step: 1, integer: true }),
    V('t', 't', 'Top at y =', { min: 2, max: 9, step: 1, integer: true }),
    V('A', 'A', 'Area', { min: 0, max: 100, step: 0.5 }),
  ],
  ...rels(
    middle('m', 'r', 'along the base'),
    R(
      'A = (r − 1)(t − 1)/2',
      '{A} = ({r} − 1) × ({t} − 1) ÷ 2',
      (v) => 2 * v.A! - (v.r! - 1) * (v.t! - 1),
      {
        A: [
          (v) => ((v.r! - 1) * (v.t! - 1)) / 2,
          '({r} − 1) × ({t} − 1) ÷ 2',
          'Half the base times the height.',
        ],
        r: [
          (v) => 1 + (2 * v.A!) / (v.t! - 1),
          '1 + 2 × {A} ÷ ({t} − 1)',
          'The base from the area and the height, then its right end.',
        ],
        t: [
          (v) => 1 + (2 * v.A!) / (v.r! - 1),
          '1 + 2 × {A} ÷ ({r} − 1)',
          'The height from the area and the base, then the top.',
        ],
      },
    ),
  ),
  example: { r: 7, m: 4, t: 5, A: 12 },
  startWith: ['r', 't'],
  representation: {
    kind: 'transformation',
    figure: [
      ['m', 't'],
      ['r', 1],
      [1, 1],
    ],
    move: 'reflect',
    mirror: { x: 'm' },
    symmetry: true,
    extent: 8,
    quadrants: 1,
  },
};

// ── H24 scaleCopy: dilation from any center, factors under 1, the side-splitter ──

/** c = k × a: a length of the copy. */
const times = (c: string, k: string, a: string, what: string): Rel =>
  R(`${c} = ${k} × ${a}`, `{${c}} = {${k}} × {${a}}`, (v) => v[c]! - v[k]! * v[a]!, {
    [c]: [(v) => v[k]! * v[a]!, `{${k}} × {${a}}`, `Multiply the ${what} by the scale factor.`],
    [k]: [
      (v) => (v[a]! === 0 ? undefined : v[c]! / v[a]!),
      `{${c}} ÷ {${a}}`,
      `The image’s ${what} over the original’s.`,
    ],
    [a]: [
      (v) => (v[k]! === 0 ? undefined : v[c]! / v[k]!),
      `{${c}} ÷ {${k}}`,
      `Undo the scale factor on the ${what}.`,
    ],
  });

/** The dilation's grid (original, image and center, a square to spare) is up to 30 squares. */
const dilationFits = (center: [number, number]): Relation => ({
  id: 'fits the grid',
  constraint: true,
  display: 'The {w} by {h} figure, its image at scale {k} and the center fit on the grid',
  vars: ['w', 'h', 'k'],
  residual: (v: Values) => {
    const [a, b] = center;
    const span = (lo: number, hi: number, c: number) => {
      const xs = [lo, hi, c, c + v.k! * (lo - c), c + v.k! * (hi - c)];
      return Math.ceil(Math.max(...xs)) - Math.floor(Math.min(...xs)) + 2;
    };
    return span(0, v.w!, a) <= 30 && span(0, v.h!, b) <= 30 ? 0 : 1;
  },
  solve: {},
});

function dilation(
  id: string,
  title: string,
  use: string,
  center: [number, number],
  example: Values,
  shape: 'rectangle' | 'triangle' | 'L' | 'trapezoid',
  assumptions: string[],
): ModuleDef {
  const cw = times('W', 'k', 'w', 'width');
  const ch = times('H', 'k', 'h', 'height');
  return {
    id,
    title,
    use,
    assumptions,
    variables: [
      V('k', 'k', 'Scale factor', { min: 0.25, max: 3, step: 0.25 }),
      V('w', 'w', 'Width', { min: 1, max: 12, step: 1, integer: true }),
      V('h', 'h', 'Height', { min: 1, max: 12, step: 1, integer: true }),
      V('W', 'W', 'Image width', { min: 0, max: 36, step: 0.25 }),
      V('H', 'H', 'Image height', { min: 0, max: 36, step: 0.25 }),
    ],
    relations: [dilationFits(center), cw.relation, ch.relation],
    steps: { 'fits the grid': {}, [cw.relation.id]: cw.steps, [ch.relation.id]: ch.steps },
    example,
    startWith: ['k', 'w', 'h'],
    representation: {
      kind: 'scaleCopy',
      factor: 'k',
      width: 'w',
      height: 'h',
      copyWidth: 'W',
      copyHeight: 'H',
      shape,
      center,
    },
  };
}

const dilationShrink = dilation(
  'g.m10-similarity-dilation-shrink',
  'Dilation by a factor under 1',
  'Use this for “Dilate the triangle by a scale factor of 1/2 with center O. How long are the new sides?”',
  [10, 8],
  { k: 0.5, w: 8, h: 6, W: 4, H: 3 },
  'triangle',
  [
    'The center O is 10 squares right of and 8 squares up from the bottom left corner.',
    'Each image point is on the ray from O through the original point, k times as far from O.',
    'A scale factor under 1 shrinks the figure toward O; every length is multiplied by k.',
  ],
);

const dilationEnlarge = dilation(
  'g.m10-similarity-dilation-enlarge',
  'Dilation from a center outside the figure',
  'Use this for “Dilate the figure by a scale factor of 2 from the point O.”',
  [-2, -1],
  { k: 2, w: 4, h: 4, W: 8, H: 8 },
  'L',
  [
    'The center O is 2 squares left of and 1 square below the bottom left corner.',
    'Each image point is on the ray from O through the original point, k times as far from O.',
    'The image is similar to the figure: its angles are the same and its sides are k times as long.',
  ],
);

const dilationInside = dilation(
  'g.m10-similarity-dilation-inside',
  'Dilation from a center inside the figure',
  'Use this for “Dilate the rectangle by 1.5 from its center.”',
  [3, 2],
  { k: 1.5, w: 6, h: 4, W: 9, H: 6 },
  'rectangle',
  [
    'The center O is the middle of the 6 by 4 rectangle.',
    'Each corner moves out along its ray from O to 1.5 times as far.',
    'The image and the figure share their center, and each side stays parallel to its image.',
  ],
);

const dilationSmall = dilation(
  'g.m10-similarity-dilation-quarter',
  'Dilation by a scale factor of 1/4',
  'Use this for “A 12 by 8 rectangle is dilated by 1/4 from its corner. How big is the image?”',
  [0, 0],
  { k: 0.25, w: 12, h: 8, W: 3, H: 2 },
  'rectangle',
  [
    'The center O is the rectangle’s bottom left corner, so that corner stays where it is.',
    'Each other point moves toward O to a quarter of its distance.',
    'The image’s area is k × k = 1/16 of the original’s.',
  ],
);

const splitter = R('AE = k × AC', '{ae} = {k} × {ac}', (v) => v.ae! - v.k! * v.ac!, {
  ae: [
    (v) => v.k! * v.ac!,
    '{k} × {ac}',
    'E is the same fraction of the way along AC as D is along AB.',
  ],
  ac: [
    (v) => (v.k! === 0 ? undefined : v.ae! / v.k!),
    '{ae} ÷ {k}',
    'AE is the fraction k of the whole side AC.',
  ],
  k: [
    (v) => (v.ac! === 0 ? undefined : v.ae! / v.ac!),
    '{ae} ÷ {ac}',
    'The fraction of AC that AE is.',
  ],
});
const fraction = R('k = AD ÷ AB', '{k} = {ad} ÷ {ab}', (v) => v.k! * v.ab! - v.ad!, {
  k: [
    (v) => (v.ab! === 0 ? undefined : v.ad! / v.ab!),
    '{ad} ÷ {ab}',
    'The small triangle ADE is triangle ABC scaled by AD over AB.',
  ],
  ad: [(v) => v.k! * v.ab!, '{k} × {ab}', 'D is the fraction k of the way from A to B.'],
  ab: [(v) => (v.k! === 0 ? undefined : v.ad! / v.k!), '{ad} ÷ {k}', 'AD is the fraction k of AB.'],
});
const len = (id: string, symbol: string, name: string, max = 50) =>
  V(id, symbol, name, { unit: 'cm', min: 0.1, max, step: 0.1 });

const sideSplitter: ModuleDef = {
  id: 'g.m10-similarity-side-splitter',
  title: 'The side-splitter: a line parallel to one side',
  use: 'Use this for “DE is parallel to BC. AD = 4, DB = 2 and AE = 6. Find EC.”',
  assumptions: [
    'D is on AB and E is on AC, and DE is parallel to BC.',
    'A line parallel to one side of a triangle cuts the other two sides in the same ratio: AD ÷ DB = AE ÷ EC.',
    'Triangle ADE is similar to triangle ABC: a dilation from A by the scale factor k = AD ÷ AB.',
  ],
  variables: [
    len('ad', 'AD', 'AD'),
    len('db', 'DB', 'DB'),
    len('ae', 'AE', 'AE'),
    len('ec', 'EC', 'EC'),
    len('ab', 'AB', 'Side AB', 100),
    len('ac', 'AC', 'Side AC', 100),
    V('k', 'k', 'Scale factor AD ÷ AB', { min: 0.01, max: 0.99, step: 0.01 }),
  ],
  ...rels(
    sum('ab', 'ad', 'db', 'Side AB is AD and DB put together.'),
    sum('ac', 'ae', 'ec', 'Side AC is AE and EC put together.'),
    fraction,
    splitter,
  ),
  example: { ad: 4, db: 2, ae: 6, ec: 3, ab: 6, ac: 9, k: 2 / 3 },
  startWith: ['ad', 'db', 'ae'],
  representation: {
    kind: 'scaleCopy',
    factor: 'k',
    width: 'ab',
    height: 'ac',
    splitter: { parts: ['ad', 'db', 'ae', 'ec'] },
  },
};

const sideSplitterBase: ModuleDef = {
  id: 'g.m10-similarity-side-splitter-base',
  title: 'The side-splitter: the parallel side',
  use: 'Use this for “DE is parallel to BC, AD = 2, AB = 8 and BC = 12. How long is DE?”',
  assumptions: [
    'DE is parallel to BC, with D on AB and E on AC.',
    'Triangle ADE is similar to triangle ABC with scale factor k = AD ÷ AB.',
    'So DE = k × BC, and AE = k × AC.',
  ],
  standalone: { vars: ['ac', 'ae'], why: 'AE follows from AC and the scale factor alone.' },
  variables: [
    len('ab', 'AB', 'Side AB', 100),
    len('ac', 'AC', 'Side AC', 100),
    len('bc', 'BC', 'Side BC', 100),
    len('ad', 'AD', 'AD'),
    V('k', 'k', 'Scale factor AD ÷ AB', { min: 0.01, max: 0.99, step: 0.01 }),
    len('ae', 'AE', 'AE'),
    len('de', 'DE', 'DE'),
  ],
  ...rels(
    {
      relation: {
        id: 'the three sides close',
        constraint: true,
        display: '{ab}, {ac} and {bc} close into a triangle',
        vars: ['ab', 'ac', 'bc'],
        residual: (v: Values) =>
          2 * Math.max(v.ab!, v.ac!, v.bc!) < v.ab! + v.ac! + v.bc! ? 0 : 1,
        solve: {},
      },
      steps: {},
    },
    fraction,
    splitter,
    times('de', 'k', 'bc', 'side BC'),
  ),
  example: { ab: 8, ac: 10, bc: 12, ad: 2, k: 0.25, ae: 2.5, de: 3 },
  startWith: ['ab', 'ac', 'bc', 'ad'],
  representation: {
    kind: 'scaleCopy',
    factor: 'k',
    width: 'ab',
    height: 'ac',
    splitter: { base: ['de', 'bc'] },
  },
};

// ── H25 coordinatePlane: midpoint, partition, distance, side slopes ──

const ENDS = [
  coord('x1', 'x₁', 'x of A'),
  coord('y1', 'y₁', 'y of A'),
  coord('x2', 'x₂', 'x of B'),
  coord('y2', 'y₂', 'y of B'),
];

/** c = (a + b) ÷ 2. */
const half = (c: string, a: string, b: string, what: string): Rel =>
  R(`${c} = (${a} + ${b})/2`, `{${c}} = ({${a}} + {${b}}) ÷ 2`, (v) => 2 * v[c]! - v[a]! - v[b]!, {
    [c]: [
      (v) => (v[a]! + v[b]!) / 2,
      `({${a}} + {${b}}) ÷ 2`,
      `The midpoint’s ${what} is the average of the ends’.`,
    ],
    [a]: [
      (v) => 2 * v[c]! - v[b]!,
      `2 × {${c}} − {${b}}`,
      `The midpoint is halfway, so A is as far on the other side.`,
    ],
    [b]: [
      (v) => 2 * v[c]! - v[a]!,
      `2 × {${c}} − {${a}}`,
      `The midpoint is halfway, so B is as far on the other side.`,
    ],
  });

const midpointDemo: ModuleDef = {
  id: 'g.m10-coordinate-geometry-midpoint',
  title: 'The midpoint of a segment',
  use: 'Use this for “Find the midpoint of the segment from A(−4, 1) to B(6, 5).”',
  assumptions: [
    'The midpoint M is halfway from A to B, across and up.',
    'Its coordinates are the averages: ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2).',
    'AM and MB are equal, marked with one tick each.',
  ],
  standalone: {
    vars: ['x1', 'x2', 'mx'],
    why: 'The x-coordinates are worked out apart from the y.',
  },
  variables: [
    ...ENDS,
    V('mx', 'x', 'x of M', { min: -10, max: 10, step: 0.5 }),
    V('my', 'y', 'y of M', { min: -10, max: 10, step: 0.5 }),
  ],
  ...rels(half('mx', 'x1', 'x2', 'x'), half('my', 'y1', 'y2', 'y')),
  example: { x1: -4, y1: 1, x2: 6, y2: 5, mx: 1, my: 3 },
  startWith: ['x1', 'y1', 'x2', 'y2'],
  representation: {
    kind: 'coordinatePlane',
    x: 'x1',
    y: 'y1',
    second: { x: 'x2', y: 'y2' },
    segment: true,
    midpoint: { x: 'mx', y: 'my' },
    extent: 8,
    quadrants: 4,
  },
};

/** p = a + m ÷ (m + n) × (b − a). */
const partPoint = (p: string, a: string, b: string, what: string): Rel =>
  R(
    `${p} = ${a} + m/(m + n) × (${b} − ${a})`,
    `{${p}} = {${a}} + {m} ÷ ({m} + {n}) × ({${b}} − {${a}})`,
    (v) => (v[p]! - v[a]!) * (v.m! + v.n!) - v.m! * (v[b]! - v[a]!),
    {
      [p]: [
        (v) => (v.m! + v.n! === 0 ? undefined : v[a]! + (v.m! / (v.m! + v.n!)) * (v[b]! - v[a]!)),
        `{${a}} + {m} ÷ ({m} + {n}) × ({${b}} − {${a}})`,
        `Start at A and go m of the m + n equal pieces of the change in ${what}.`,
      ],
      [b]: [
        (v) => (v.m! === 0 ? undefined : v[a]! + ((v[p]! - v[a]!) * (v.m! + v.n!)) / v.m!),
        `{${a}} + ({${p}} − {${a}}) × ({m} + {n}) ÷ {m}`,
        'From A to P is m pieces; B is m + n pieces from A.',
      ],
      m: [
        (v) => (v[b]! === v[p]! ? undefined : (v.n! * (v[p]! - v[a]!)) / (v[b]! - v[p]!)),
        `{n} × ({${p}} − {${a}}) ÷ ({${b}} − {${p}})`,
        'AP is to PB as m is to n.',
      ],
      n: [
        (v) => (v[p]! === v[a]! ? undefined : (v.m! * (v[b]! - v[p]!)) / (v[p]! - v[a]!)),
        `{m} × ({${b}} − {${p}}) ÷ ({${p}} − {${a}})`,
        'PB is to AP as n is to m.',
      ],
      [a]: [
        (v) => (v.n! === 0 ? undefined : (v[p]! * (v.m! + v.n!) - v.m! * v[b]!) / v.n!),
        `({${p}} × ({m} + {n}) − {m} × {${b}}) ÷ {n}`,
        'Undo the step from A to P.',
      ],
    },
  );

const partitionDemo: ModuleDef = {
  id: 'g.m10-coordinate-geometry-partition',
  title: 'The point that splits a segment in a ratio',
  use: 'Use this for “Find the point P on AB that splits it in the ratio 2:3, from A(−3, 1) to B(7, 6).”',
  assumptions: [
    'P is on AB with AP:PB = m:n.',
    'Cut AB into m + n equal pieces; P is m pieces from A, the fraction m ÷ (m + n) of the way.',
    'The same fraction of the change across and of the change up.',
  ],
  variables: [
    ...ENDS,
    V('m', 'm', 'Pieces from A to P', { min: 1, max: 10, step: 1, integer: true }),
    V('n', 'n', 'Pieces from P to B', { min: 1, max: 10, step: 1, integer: true }),
    V('px', 'x', 'x of P', { min: -10, max: 10, step: 0.1 }),
    V('py', 'y', 'y of P', { min: -10, max: 10, step: 0.1 }),
  ],
  ...rels(partPoint('px', 'x1', 'x2', 'x'), partPoint('py', 'y1', 'y2', 'y')),
  example: { x1: -3, y1: 1, x2: 7, y2: 6, m: 2, n: 3, px: 1, py: 3 },
  startWith: ['x1', 'y1', 'x2', 'y2', 'm', 'n'],
  representation: {
    kind: 'coordinatePlane',
    x: 'x1',
    y: 'y1',
    second: { x: 'x2', y: 'y2' },
    segment: true,
    partition: { ratio: ['m', 'n'], x: 'px', y: 'py' },
    extent: 8,
    quadrants: 4,
  },
};

const distanceMidDemo: ModuleDef = {
  id: 'g.m10-coordinate-geometry-distance',
  title: 'Distance and midpoint',
  use: 'Use this for “How long is the segment from A(1, −2) to B(7, 6), and where is its middle?”',
  assumptions: [
    'The segment is the long side of a right triangle with legs across and up.',
    'd = √((x₂ − x₁)² + (y₂ − y₁)²), the Pythagorean theorem on the legs.',
    'The midpoint averages the coordinates.',
  ],
  variables: [
    ...ENDS,
    V('d', 'd', 'Distance', { min: 0, max: 30, step: 0.01 }),
    V('mx', 'x', 'x of M', { min: -10, max: 10, step: 0.5 }),
    V('my', 'y', 'y of M', { min: -10, max: 10, step: 0.5 }),
  ],
  ...rels(
    R(
      'd = √((x₂ − x₁)² + (y₂ − y₁)²)',
      '{d} = √(({x2} − {x1})² + ({y2} − {y1})²)',
      (v) => v.d! - Math.hypot(v.x2! - v.x1!, v.y2! - v.y1!),
      {
        d: [
          (v) => Math.hypot(v.x2! - v.x1!, v.y2! - v.y1!),
          '√(({x2} − {x1})² + ({y2} − {y1})²)',
          'Square the legs, add, and take the square root.',
        ],
        x1: null,
        y1: null,
        x2: null,
        y2: null,
      },
    ),
    half('mx', 'x1', 'x2', 'x'),
    half('my', 'y1', 'y2', 'y'),
  ),
  example: { x1: 1, y1: -2, x2: 7, y2: 6, d: 10, mx: 4, my: 2 },
  startWith: ['x1', 'y1', 'x2', 'y2'],
  representation: {
    kind: 'coordinatePlane',
    x: 'x1',
    y: 'y1',
    second: { x: 'x2', y: 'y2' },
    segment: true,
    legs: true,
    distance: 'd',
    midpoint: { x: 'mx', y: 'my' },
    extent: 8,
    quadrants: 4,
  },
};

/** m = (b_y − a_y) ÷ (b_x − a_x), the slope of side AB. */
const sideSlope = (m: string, a: string, b: string): Rel => {
  const [ax, ay, bx, by] = [`${a}x`, `${a}y`, `${b}x`, `${b}y`];
  const name = `${a.toUpperCase()}${b.toUpperCase()}`;
  return R(
    `m${name} = (${b}y − ${a}y)/(${b}x − ${a}x)`,
    `{${m}} = ({${by}} − {${ay}}) ÷ ({${bx}} − {${ax}})`,
    // A vertical side (run 0) has no slope: no m fits.
    (v) => (v[bx]! === v[ax]! ? 1 : v[m]! - (v[by]! - v[ay]!) / (v[bx]! - v[ax]!)),
    {
      [m]: [
        (v) => (v[bx]! === v[ax]! ? undefined : (v[by]! - v[ay]!) / (v[bx]! - v[ax]!)),
        `({${by}} − {${ay}}) ÷ ({${bx}} − {${ax}})`,
        `Rise over run from ${a.toUpperCase()} to ${b.toUpperCase()}.`,
      ],
      [ax]: null,
      [ay]: null,
      [bx]: null,
      [by]: null,
    },
  );
};

/** Corner P's coordinates, (p₁, p₂). */
const corner = (p: string) => [
  coord(`${p}x`, `${p}₁`, `x of ${p.toUpperCase()}`),
  coord(`${p}y`, `${p}₂`, `y of ${p.toUpperCase()}`),
];
const slopeVar = (id: string, side: string, k: number) =>
  V(id, `m${'₁₂₃₄'[k - 1]}`, `Slope of ${side}`, { min: -100, max: 100, step: 0.01 });

function quadrilateralSlopes(
  id: string,
  title: string,
  use: string,
  example: Values,
  assumptions: string[],
): ModuleDef {
  return {
    id,
    title,
    use,
    assumptions,
    variables: [
      ...['a', 'b', 'c', 'd'].flatMap(corner),
      slopeVar('mab', 'AB', 1),
      slopeVar('mbc', 'BC', 2),
      slopeVar('mcd', 'CD', 3),
      slopeVar('mda', 'DA', 4),
    ],
    ...rels(
      sideSlope('mab', 'a', 'b'),
      sideSlope('mbc', 'b', 'c'),
      sideSlope('mcd', 'c', 'd'),
      sideSlope('mda', 'd', 'a'),
    ),
    example,
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
      extent: 6,
      quadrants: 4,
    },
  };
}

const slopesParallelogram = quadrilateralSlopes(
  'g.m10-coordinate-geometry-parallelogram',
  'Slopes show a parallelogram',
  'Use this for “Show that A(−3, −2), B(3, 1), C(5, 5), D(−1, 2) make a parallelogram.”',
  { ax: -3, ay: -2, bx: 3, by: 1, cx: 5, cy: 5, dx: -1, dy: 2, mab: 0.5, mbc: 2, mcd: 0.5, mda: 2 },
  [
    'Sides with equal slopes are parallel.',
    'A quadrilateral with both pairs of opposite sides parallel is a parallelogram.',
  ],
);

const slopesRectangle = quadrilateralSlopes(
  'g.m10-coordinate-geometry-rectangle',
  'Slopes show a rectangle',
  'Use this for “Is A(−4, 1), B(0, −1), C(2, 3), D(−2, 5) a rectangle?”',
  {
    ax: -4,
    ay: 1,
    bx: 0,
    by: -1,
    cx: 2,
    cy: 3,
    dx: -2,
    dy: 5,
    mab: -0.5,
    mbc: 2,
    mcd: -0.5,
    mda: 2,
  },
  [
    'Sides with equal slopes are parallel.',
    'Two sides are perpendicular when their slopes multiply to −1.',
    'A parallelogram with a right angle is a rectangle.',
  ],
);

const slopesRightTriangle: ModuleDef = {
  id: 'g.m10-coordinate-geometry-right-triangle',
  title: 'A right triangle with a vertical side',
  use: 'Use this for “Is the triangle A(−3, −2), B(−3, 4), C(5, −2) a right triangle?”',
  assumptions: [
    'A vertical side has no slope (its run is 0); a level side has slope 0.',
    'A vertical side and a level side are perpendicular.',
  ],
  variables: [
    ...['a', 'b', 'c'].flatMap(corner),
    slopeVar('mbc', 'BC', 1),
    slopeVar('mca', 'CA', 2),
  ],
  ...rels(sideSlope('mbc', 'b', 'c'), sideSlope('mca', 'c', 'a')),
  example: { ax: -3, ay: -2, bx: -3, by: 4, cx: 5, cy: -2, mbc: -0.75, mca: 0 },
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
    extent: 6,
    quadrants: 4,
  },
};

// ── H26 circle: a sector by its angle in degrees or radians, and what a radian is ──

const radiusVar = V('r', 'r', 'Radius', { unit: 'cm', min: 0.1, max: 100, step: 0.1 });
const arcVar = V('s', 's', 'Arc length', { unit: 'cm', min: 0, max: 700, step: 0.01 });
const sectorAreaVar = V('A', 'A', 'Sector area', { unit: 'cm²', min: 0, max: 40000, step: 0.01 });

/** s = θ ÷ 360 × 2πr and A = θ ÷ 360 × πr² (degrees). */
const arcDegrees = R(
  's = θ/360 × 2πr',
  '{s} = {t} ÷ 360 × 2 × π × {r}',
  (v) => v.s! - (v.t! / 360) * 2 * Math.PI * v.r!,
  {
    s: [
      (v) => (v.t! / 360) * 2 * Math.PI * v.r!,
      '{t} ÷ 360 × 2 × π × {r}',
      'The arc is the angle’s share of the whole circumference.',
    ],
    t: [
      (v) => (v.r! === 0 ? undefined : (360 * v.s!) / (2 * Math.PI * v.r!)),
      '360 × {s} ÷ (2 × π × {r})',
      'The arc’s share of the circumference, as a share of 360°.',
    ],
    r: [
      (v) => (v.t! === 0 ? undefined : (360 * v.s!) / (2 * Math.PI * v.t!)),
      '360 × {s} ÷ (2 × π × {t})',
      'Undo the share of the circumference.',
    ],
  },
);
const areaDegrees = R(
  'A = θ/360 × πr²',
  '{A} = {t} ÷ 360 × π × {r}²',
  (v) => v.A! - (v.t! / 360) * Math.PI * v.r! ** 2,
  {
    A: [
      (v) => (v.t! / 360) * Math.PI * v.r! ** 2,
      '{t} ÷ 360 × π × {r}²',
      'The sector is the angle’s share of the whole disc.',
    ],
    t: [
      (v) => (v.r! === 0 ? undefined : (360 * v.A!) / (Math.PI * v.r! ** 2)),
      '360 × {A} ÷ (π × {r}²)',
      'The sector’s share of the disc, as a share of 360°.',
    ],
    r: [
      (v) => (v.t! <= 0 || v.A! < 0 ? undefined : Math.sqrt((360 * v.A!) / (Math.PI * v.t!))),
      '√(360 × {A} ÷ (π × {t}))',
      'Undo the share, then the square.',
    ],
  },
);
/** s = rθ and A = r²θ ÷ 2 (radians). */
const arcRadians = R('s = rθ', '{s} = {r} × {t}', (v) => v.s! - v.r! * v.t!, {
  s: [(v) => v.r! * v.t!, '{r} × {t}', 'In radians the arc is the angle times the radius.'],
  t: [
    (v) => (v.r! === 0 ? undefined : v.s! / v.r!),
    '{s} ÷ {r}',
    'How many radius-lengths the arc is.',
  ],
  r: [(v) => (v.t! === 0 ? undefined : v.s! / v.t!), '{s} ÷ {t}', 'Undo multiplying by the angle.'],
});
const areaRadians = R('A = r²θ/2', '{A} = {r}² × {t} ÷ 2', (v) => v.A! - (v.r! ** 2 * v.t!) / 2, {
  A: [
    (v) => (v.r! ** 2 * v.t!) / 2,
    '{r}² × {t} ÷ 2',
    'The angle’s share of πr², θ ÷ 2π × πr², is r²θ ÷ 2.',
  ],
  t: [
    (v) => (v.r! === 0 ? undefined : (2 * v.A!) / v.r! ** 2),
    '2 × {A} ÷ {r}²',
    'Undo the halving, then divide by r².',
  ],
  r: [
    (v) => (v.t! <= 0 || v.A! < 0 ? undefined : Math.sqrt((2 * v.A!) / v.t!)),
    '√(2 × {A} ÷ {t})',
    'Undo the halving and the angle, then the square.',
  ],
});

const degreeAngle = V('t', 'θ', 'Central angle', { unit: '°', min: 1, max: 360, step: 1 });
const radianAngle = V('t', 'θ', 'Central angle (radians)', { min: 0.01, max: 6.28, step: 0.01 });

function sectorDemo(
  id: string,
  title: string,
  use: string,
  radians: boolean,
  example: Values,
  assumptions: string[],
  views?: ('sector' | 'radian')[],
): ModuleDef {
  return {
    id,
    title,
    use,
    assumptions,
    variables: [radiusVar, radians ? radianAngle : degreeAngle, arcVar, sectorAreaVar],
    ...rels(...(radians ? [arcRadians, areaRadians] : [arcDegrees, areaDegrees])),
    example,
    startWith: ['r', 't'],
    unitSystems: ['metric'],
    representation: {
      kind: 'circle',
      radius: 'r',
      extent: 1,
      sector: { angle: 't', unit: radians ? 'radians' : 'degrees', arc: 's', area: 'A' },
      ...(views ? { views } : {}),
    },
  };
}

const sectorDegrees = sectorDemo(
  'g.m10-arc-sector-degrees',
  'Arc length and sector area in degrees',
  'Use this for “A circle has radius 6 cm. Find the arc length and area of a 60° sector.”',
  false,
  { r: 6, t: 60, s: 2 * Math.PI, A: 6 * Math.PI },
  [
    'A central angle of θ° cuts off θ ÷ 360 of the circle.',
    'The arc is that share of the circumference 2πr; the sector is that share of the area πr².',
  ],
);

const sectorRadians = sectorDemo(
  'g.m10-arc-sector-radians',
  'Arc length and sector area in radians',
  'Use this for “Find the arc length of a sector with radius 4 cm and central angle 3π/4.”',
  true,
  { r: 4, t: (3 * Math.PI) / 4, s: 3 * Math.PI, A: 6 * Math.PI },
  [
    'In radians the arc length is s = rθ.',
    'The sector’s area is A = r²θ ÷ 2.',
    'Type an angle like 3π/4 as a decimal (2.3562); the picture writes it with π.',
  ],
);

const sectorMajor = sectorDemo(
  'g.m10-arc-sector-major',
  'A sector bigger than half the circle',
  'Use this for “Find the area of a 300° sector of a circle of radius 10 cm.”',
  false,
  { r: 10, t: 300, s: (50 * Math.PI) / 3, A: (250 * Math.PI) / 3 },
  [
    'A central angle over 180° cuts off a major arc and a sector bigger than half the disc.',
    'It is still θ ÷ 360 of the circle.',
  ],
);

const radianMeaning = sectorDemo(
  'g.m11-unit-circle-radian',
  'What a radian is',
  'Use this for “An arc is 6 cm long on a circle of radius 3 cm. What is its angle in radians?”',
  true,
  { r: 3, t: 2, s: 6, A: 9 },
  [
    'One radian is the angle whose arc is one radius long.',
    'The angle in radians counts how many radius-lengths the arc is: θ = s ÷ r.',
    'A full turn is 2π ≈ 6.28 radius-lengths, so 2π radians = 360°.',
  ],
  ['radian', 'sector'],
);

export const HSF_GALLERY_MODULES: ModuleDef[] = [
  composeReflectRotate,
  composeGlide,
  rotateAboutPoint,
  reflectAntiDiagonal,
  symmetryRectangle,
  symmetrySquare,
  symmetryIsosceles,
  dilationShrink,
  dilationEnlarge,
  dilationInside,
  dilationSmall,
  sideSplitter,
  sideSplitterBase,
  midpointDemo,
  partitionDemo,
  distanceMidDemo,
  slopesParallelogram,
  slopesRectangle,
  slopesRightTriangle,
  sectorDegrees,
  sectorRadians,
  sectorMajor,
  radianMeaning,
];
export const HSF_GALLERY_LAYOUTS: LayoutDef[] = [];
