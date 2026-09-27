/**
 * Gallery demos for Grade 7 equations, scale drawings and circles: the hanger, the tape for
 * px + q = r, a two-step inequality, a scaled copy on a grid, and a circle unrolled and cut
 * into wedges. Spread into GALLERY_MODULES in gallery.ts; kept apart so merges stay easy.
 */
import type { Values } from '@/engine/types';

import { div, whole } from './helpers';
import type { ModuleDef } from './types';

/** A whole number, or undefined when a quotient doesn't come out whole. */
const whole0 = (x: number | undefined) =>
  x !== undefined && Math.abs(x - Math.round(x)) < 1e-9 ? Math.round(x) : undefined;

/** px + q = r, solved for any one of the four. */
const twoStep = {
  id: 'px + q = r',
  display: '{p} × {x} + {q} = {r}',
  vars: ['p', 'x', 'q', 'r'],
  residual: (v: Values) => v.p! * v.x! + v.q! - v.r!,
  solve: {
    x: (v: Values) => div(v.r! - v.q!, v.p!),
    r: (v: Values) => v.p! * v.x! + v.q!,
    q: (v: Values) => v.r! - v.p! * v.x!,
    p: (v: Values) => whole0(div(v.r! - v.q!, v.x!)),
  },
};
const twoStepSteps = {
  'px + q = r': {
    x: {
      expr: '({r} − {q}) ÷ {p}',
      how: 'Take {q} from both sides, then divide both sides by {p}.',
    },
    r: { expr: '{p} × {x} + {q}', how: 'Multiply, then add.' },
    q: { expr: '{r} − {p} × {x}', how: 'Take the blocks’ weight from the total.' },
    p: { expr: '({r} − {q}) ÷ {x}', how: 'Take {q} from both sides, then divide by {x}.' },
  },
};

/** Whether px + q (sign s: 1 <, 2 ≤, 3 >, 4 ≥) r holds at the test number t. */
const holdsAt = (v: Values) => {
  const lhs = v.p! * v.t! + v.q!;
  return [lhs < v.r!, lhs <= v.r!, lhs > v.r!, lhs >= v.r!][v.s! - 1] ?? false;
};

/** A copy's length: the original's times the scale factor k. */
const scaled = (copy: string, original: string) => ({
  id: `${copy} = k × ${original}`,
  display: `{${copy}} = {k} × {${original}}`,
  vars: [copy, 'k', original],
  residual: (v: Values) => v[copy]! - v.k! * v[original]!,
  solve: {
    [copy]: (v: Values) => v.k! * v[original]!,
    k: (v: Values) => div(v[copy]!, v[original]!),
    [original]: () => undefined,
  },
});
const scaledSteps = (copy: string, original: string) => ({
  [`${copy} = k × ${original}`]: {
    [copy]: { expr: `{k} × {${original}}`, how: 'Multiply the length by the scale factor.' },
    k: { expr: `{${copy}} ÷ {${original}}`, how: 'Divide the copy’s length by the original’s.' },
  },
});

export const G7B_GALLERY_MODULES: ModuleDef[] = [
  {
    id: 'g.hanger',
    title: 'Hanger diagram',
    assumptions: [
      'Every block weighs the same unknown amount x; every small weight weighs 1.',
      'The hanger is level when both sides weigh the same: that is what = means.',
      'Taking the same from both sides, or keeping one of equal parts of both, keeps it level.',
    ],
    variables: [
      whole('p', 'p', 'Blocks', 1, 8),
      whole('q', 'q', 'Weights with the blocks', 0, 20),
      whole('r', 'r', 'Weights on the right', 0, 40),
      { id: 'x', symbol: 'x', name: 'Block weight', min: 0, max: 40, step: 0.5 },
    ],
    relations: [twoStep],
    steps: twoStepSteps,
    example: { p: 3, q: 2, r: 11, x: 3 },
    startWith: ['p', 'q', 'r'],
    representation: {
      kind: 'hanger',
      unknown: 'x',
      left: { x: 'p', units: 'q' },
      right: { units: 'r' },
      steps: true,
    },
  },
  {
    id: 'g.tape-equation',
    title: 'Tape for px + q = r',
    assumptions: [
      'The bar is p equal boxes of x and a piece q, together as long as r.',
      'A negative q is a piece taken off the end of the boxes.',
    ],
    variables: [
      whole('p', 'p', 'Boxes', 1, 12),
      whole('q', 'q', 'Added', -50, 50),
      whole('r', 'r', 'Total', 0, 200),
      { id: 'x', symbol: 'x', name: 'One box', min: 0.5, max: 100, step: 0.5 },
    ],
    relations: [twoStep],
    steps: twoStepSteps,
    example: { p: 3, q: 5, r: 20, x: 5 },
    startWith: ['p', 'q', 'r'],
    representation: {
      kind: 'tape',
      equation: { times: 'p', unknown: 'x', plus: 'q', total: 'r' },
    },
  },
  {
    id: 'g.tape-equation-grouped',
    title: 'Tape for p(x + q) = r',
    assumptions: [
      'The bar is p equal groups, each x and q, together as long as r.',
      'A negative q makes each group x less q: one box “x − 15”.',
    ],
    variables: [
      whole('p', 'p', 'Groups', 1, 12),
      whole('q', 'q', 'Added to each', -50, 50),
      whole('r', 'r', 'Total', 1, 300),
      { id: 'x', symbol: 'x', name: 'Unknown', min: 0.5, max: 100, step: 0.5 },
    ],
    relations: [
      {
        id: 'p(x + q) = r',
        display: '{p} × ({x} + {q}) = {r}',
        vars: ['p', 'x', 'q', 'r'],
        residual: (v: Values) => v.p! * (v.x! + v.q!) - v.r!,
        solve: {
          x: (v: Values) => {
            const each = div(v.r!, v.p!);
            return each === undefined ? undefined : each - v.q!;
          },
          r: (v: Values) => v.p! * (v.x! + v.q!),
          q: (v: Values) => {
            const each = div(v.r!, v.p!);
            return each === undefined ? undefined : each - v.x!;
          },
          p: (v: Values) => whole0(div(v.r!, v.x! + v.q!)),
        },
      },
    ],
    steps: {
      'p(x + q) = r': {
        x: {
          expr: '{r} ÷ {p} − {q}',
          how: 'Divide both sides by {p}, then take {q} from both sides.',
        },
        r: { expr: '{p} × ({x} + {q})', how: 'Add inside the brackets, then multiply.' },
        q: { expr: '{r} ÷ {p} − {x}', how: 'Divide by {p} for one group, then take away {x}.' },
        p: { expr: '{r} ÷ ({x} + {q})', how: 'Divide the total by one group.' },
      },
    },
    example: { p: 3, q: -15, r: 90, x: 45 },
    startWith: ['p', 'q', 'r'],
    representation: {
      kind: 'tape',
      equation: { times: 'p', unknown: 'x', plus: 'q', total: 'r', grouped: true },
    },
  },
  {
    id: 'g.two-step-inequality',
    title: 'Two-step inequality',
    assumptions: [
      'Adding or taking the same number from both sides keeps an inequality true.',
      'Dividing both sides by a negative number flips the sign (< becomes >).',
      'A test number is a solution when it makes the written inequality true.',
    ],
    variables: [
      whole('p', 'p', 'Times x', -10, 10),
      whole('q', 'q', 'Added', -20, 20),
      whole('r', 'r', 'Right side', -50, 50),
      whole('s', 's', 'Sign (1 <, 2 ≤, 3 >, 4 ≥)', 1, 4),
      { id: 'b', symbol: 'b', name: 'Bound', min: -100, max: 100, derived: true },
      whole('t', 't', 'Test number', -20, 20),
      { ...whole('h', 'h', 'True (1) or false (0)', 0, 1), derived: true },
    ],
    relations: [
      {
        id: 'p ≠ 0',
        constraint: true,
        display: '{p} is not 0',
        vars: ['p'],
        residual: (v: Values) => (v.p! !== 0 ? 0 : 1),
        solve: {},
      },
      {
        id: 'b = (r − q) ÷ p',
        display: '{b} = ({r} − {q}) ÷ {p}',
        vars: ['b', 'r', 'q', 'p'],
        residual: (v: Values) => v.b! * v.p! - (v.r! - v.q!),
        solve: {
          b: (v: Values) => div(v.r! - v.q!, v.p!),
          r: (v: Values) => v.b! * v.p! + v.q!,
          q: (v: Values) => v.r! - v.b! * v.p!,
          p: () => undefined,
        },
      },
      {
        id: 'h = test',
        display: 'test {t} in {p}x + {q}, sign {s}, {r}: {h}',
        check: (v: Values) => `${holdsAt(v) ? 1 : 0} = ${v.h}`,
        vars: ['h', 't', 's', 'p', 'q', 'r'],
        residual: (v: Values) => ([1, 2, 3, 4].includes(v.s!) ? v.h! - (holdsAt(v) ? 1 : 0) : NaN),
        solve: {
          h: (v: Values) => (holdsAt(v) ? 1 : 0),
          t: () => undefined,
          s: () => undefined,
          p: () => undefined,
          q: () => undefined,
          r: () => undefined,
        },
      },
    ],
    steps: {
      'p ≠ 0': {},
      'b = (r − q) ÷ p': {
        b: {
          expr: '({r} − {q}) ÷ {p}',
          how: 'Take {q} from both sides, then divide both sides by {p}.',
        },
        r: { expr: '{b} × {p} + {q}', how: 'Undo the steps: multiply, then add.' },
        q: { expr: '{r} − {b} × {p}', how: 'Take the x part from the right side.' },
      },
      'h = test': {
        h: {
          expr: (v: Values) => `${holdsAt(v) ? 1 : 0}`,
          how: 'Put the test number in for x. True is 1, false is 0.',
          work: (v: Values) => {
            const pt = v.p! * v.t!;
            const lhs = pt + v.q!;
            return [
              `${v.p} × ${v.t! < 0 ? `(${v.t})` : v.t} = ${pt}`,
              `${pt < 0 ? `(${pt})` : pt} ${v.q! < 0 ? '−' : '+'} ${Math.abs(v.q!)} = ${lhs}`,
              `${lhs} ${'<≤>≥'[v.s! - 1]} ${v.r} is ${holdsAt(v) ? 'true' : 'false'}`,
            ];
          },
          written: false,
        },
      },
    },
    example: { p: -2, q: 1, r: 7, s: 2, b: -3, t: 1, h: 1 },
    startWith: ['p', 'q', 'r', 's', 't'],
    representation: {
      kind: 'integerLine',
      value: 'b',
      min: -8,
      max: 8,
      inequality: { sign: 's', test: 't', twoStep: { times: 'p', plus: 'q', total: 'r' } },
    },
  },
  {
    id: 'g.scale-copy',
    title: 'Scaled copy on a grid',
    assumptions: [
      'A scaled copy multiplies every length of the figure by the same scale factor.',
      'Its angles stay the same, so the copy has the same shape.',
    ],
    variables: [
      { id: 'k', symbol: 'k', name: 'Scale factor', min: 0.5, max: 3, step: 0.5 },
      whole('w', 'w', 'Width', 1, 6),
      whole('h', 'h', 'Height', 1, 6),
      { id: 'W', symbol: 'W', name: 'Copy width', min: 0, max: 24, derived: true },
      { id: 'H', symbol: 'H', name: 'Copy height', min: 0, max: 24, derived: true },
    ],
    relations: [scaled('W', 'w'), scaled('H', 'h')],
    steps: { ...scaledSteps('W', 'w'), ...scaledSteps('H', 'h') },
    example: { k: 2, w: 4, h: 4, W: 8, H: 8 },
    startWith: ['k', 'w', 'h'],
    representation: {
      kind: 'scaleCopy',
      factor: 'k',
      width: 'w',
      height: 'h',
      copyWidth: 'W',
      copyHeight: 'H',
      shape: 'L',
    },
  },
  {
    id: 'g.scale-copy-area',
    title: 'Scaled copy and its area',
    assumptions: [
      'Every length of the copy is k times the original’s.',
      'Its area is k × k times the original’s: k times as wide and k times as tall.',
    ],
    variables: [
      { id: 'k', symbol: 'k', name: 'Scale factor', min: 0.5, max: 3, step: 0.5 },
      whole('w', 'w', 'Base', 1, 6),
      whole('h', 'h', 'Height', 1, 6),
      { id: 'A', symbol: 'A', name: 'Area', min: 0, max: 64, derived: true },
      { id: 'B', symbol: 'B', name: 'Copy area', min: 0, max: 600, derived: true },
    ],
    relations: [
      {
        id: 'A = w × h ÷ 2',
        display: '{A} = {w} × {h} ÷ 2',
        vars: ['A', 'w', 'h'],
        residual: (v: Values) => v.A! - (v.w! * v.h!) / 2,
        solve: {
          A: (v: Values) => (v.w! * v.h!) / 2,
          w: () => undefined,
          h: () => undefined,
        },
      },
      {
        id: 'B = A × k²',
        display: '{B} = {A} × {k} × {k}',
        vars: ['B', 'A', 'k'],
        residual: (v: Values) => v.B! - v.A! * v.k! * v.k!,
        solve: {
          B: (v: Values) => v.A! * v.k! * v.k!,
          A: () => undefined,
          k: () => undefined,
        },
      },
    ],
    steps: {
      'A = w × h ÷ 2': {
        A: { expr: '{w} × {h} ÷ 2', how: 'A triangle is half of its base times its height.' },
      },
      'B = A × k²': {
        B: {
          expr: '{A} × {k} × {k}',
          how: 'The copy is k times as wide and k times as tall: k × k times the area.',
        },
      },
    },
    example: { k: 2, w: 4, h: 3, A: 6, B: 24 },
    startWith: ['k', 'w', 'h'],
    representation: {
      kind: 'scaleCopy',
      factor: 'k',
      width: 'w',
      height: 'h',
      area: ['A', 'B'],
      shape: 'triangle',
    },
  },
];
