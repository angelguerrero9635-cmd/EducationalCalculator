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
];
