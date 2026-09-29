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

/** A relation with its solve functions and step text, one entry per variable. */
function R(
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, string, string]>,
): Rel {
  return {
    relation: {
      id,
      display,
      vars: Object.keys(parts),
      residual,
      solve: Object.fromEntries(Object.entries(parts).map(([k, [f]]) => [k, f])),
    },
    steps: Object.fromEntries(
      Object.entries(parts).map(([k, [, expr, how]]) => [k, { expr, how }]),
    ),
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
];
export const HSF_GALLERY_LAYOUTS: LayoutDef[] = [];
