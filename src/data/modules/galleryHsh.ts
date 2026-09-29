/**
 * Grades 9–12 gallery demos (group HH; see pictureRequestsHs.ts and docs/RENDERINGS_HS.md).
 * Each demo stands in for a planned page: real variables, relations, steps and a use line, so
 * `scripts/promote-demo.mjs` can copy it into a grade file. Spread into gallery.ts.
 *
 * Biology H37–H42: gel electrophoresis and PCR, allele frequencies, cladograms, energy
 * pyramids, succession and the nitrogen cycle, feedback loops, and the immune response.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from './helpers';
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

type Rel = { relation: Relation; steps: Record<string, StepText> };

const V = (
  id: string,
  symbol: string,
  name: string,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...extra });

const rels = (...rs: Rel[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

/** total = the parts added; `what` names the parts ("fragments"). */
function total(t: string, parts: string[], symbols: Record<string, string>, what: string): Rel {
  const rest = (p: string) => parts.filter((x) => x !== p);
  const sym = (id: string) => symbols[id] ?? id;
  return {
    relation: {
      id: `${sym(t)} = ${parts.map(sym).join(' + ')}`,
      display: `{${t}} = ${parts.map((p) => `{${p}}`).join(' + ')}`,
      vars: [t, ...parts],
      residual: (v: Values) => v[t]! - parts.reduce((s, p) => s + v[p]!, 0),
      solve: Object.fromEntries([
        [t, (v: Values) => parts.reduce((s, p) => s + v[p]!, 0)],
        ...parts.map((p) => [p, (v: Values) => v[t]! - rest(p).reduce((s, q) => s + v[q]!, 0)]),
      ]),
    },
    steps: Object.fromEntries([
      [
        t,
        {
          expr: parts.map((p) => `{${p}}`).join(' + '),
          how: `The ${what} add back up to the whole piece.`,
        },
      ],
      ...parts.map((p) => [
        p,
        {
          expr: `{${t}} − ${rest(p)
            .map((q) => `{${q}}`)
            .join(' − ')}`,
          how: `Take the other ${what} away from the whole.`,
        },
      ]),
    ]),
  };
}

// ── H37 gel: gel electrophoresis and PCR ──

const bp = (id: string, symbol: string, name: string, derived = false) =>
  V(id, symbol, name, { unit: 'bp', min: 10, max: 20000, step: 10, integer: true, derived });

const GEL_WHY = [
  'DNA is negatively charged, so in the gel it moves away from the − end toward +.',
  'Short pieces slip through the gel faster, so they run farther; the ladder’s known sizes are the ruler.',
  'Distance run falls with the log of the size: each 10 times longer runs the same step less far.',
];

const gelCut: ModuleDef = {
  id: 'g.s9-biotechnology-gel',
  title: 'Gel electrophoresis: a piece of DNA cut once',
  use: 'Use this for the fragments a restriction enzyme makes and where they run on a gel.',
  assumptions: [
    'A restriction enzyme cuts the linear DNA at its one recognition site, making two fragments.',
    ...GEL_WHY,
  ],
  variables: [
    bp('L', 'L', 'Length of the uncut DNA'),
    bp('a', 'a', 'Longer fragment'),
    bp('b', 'b', 'Shorter fragment'),
  ],
  ...rels(total('L', ['a', 'b'], {}, 'fragments')),
  example: { L: 4000, a: 2500, b: 1500 },
  startWith: ['L', 'a'],
  representation: {
    kind: 'gel',
    lanes: [
      { label: 'Uncut', bands: ['L'] },
      { label: 'Cut', bands: ['a', 'b'] },
    ],
    keep: ['L'],
  },
};

const gelDouble: ModuleDef = {
  id: 'g.s9-biotechnology-gel-map',
  title: 'Mapping cut sites from a double digest',
  use: 'Use this for placing two enzymes’ cut sites from the fragments each one makes.',
  assumptions: [
    'Enzyme A cuts the linear DNA once, and enzyme B cuts it once at another site.',
    'Cut with both, the DNA falls into three pieces in order: a, then b, then c.',
    'Enzyme A alone leaves a and the piece b + c; enzyme B alone leaves a + b and c.',
    GEL_WHY[1]!,
  ],
  variables: [
    bp('L', 'L', 'Length of the DNA'),
    bp('a', 'a', 'Left piece'),
    bp('b', 'b', 'Middle piece'),
    bp('c', 'c', 'Right piece'),
    bp('x', 'x', 'Enzyme A’s second piece (b + c)', true),
    bp('y', 'y', 'Enzyme B’s first piece (a + b)', true),
  ],
  ...rels(
    total('L', ['a', 'b', 'c'], {}, 'three pieces'),
    total('x', ['b', 'c'], {}, 'pieces right of site A'),
    total('y', ['a', 'b'], {}, 'pieces left of site B'),
  ),
  example: { L: 5000, a: 3000, b: 1200, c: 800, x: 2000, y: 4200 },
  startWith: ['L', 'a', 'b'],
  representation: {
    kind: 'gel',
    lanes: [
      { label: 'Uncut', bands: ['L'] },
      { label: 'A', bands: ['a', 'x'] },
      { label: 'B', bands: ['y', 'c'] },
      { label: 'A and B', bands: ['a', 'b', 'c'] },
    ],
    // Three typed pieces share one lane: no handles, the boxes set the sizes.
    fixed: true,
  },
};

const gelSmall: ModuleDef = {
  ...gelCut,
  id: 'g.s9-biotechnology-gel-small',
  title: 'Gel electrophoresis: a cut near one end',
  use: 'Use this for a cut near the end of the DNA: one long fragment and one very short one.',
  example: { L: 9000, a: 8850, b: 150 },
};

const pcr: ModuleDef = {
  id: 'g.s9-biotechnology-pcr',
  title: 'PCR: copies double each cycle',
  use: 'Use this for the copies of a DNA piece after n cycles of PCR, N = N₀ × 2ⁿ.',
  assumptions: [
    'Each cycle heats the DNA to separate the strands, cools it so primers bind, and copies each strand.',
    'Every strand is copied each cycle, so the number of copies doubles.',
    'Real reactions slow down after about 30 cycles, when the primers and nucleotides run low.',
  ],
  variables: [
    V('n0', 'N₀', 'Starting copies', { min: 1, max: 1000, step: 1, integer: true }),
    V('n', 'n', 'Cycles', { min: 0, max: 40, step: 1, integer: true }),
    V('N', 'N', 'Copies after n cycles', { min: 1, max: 1e15 }),
  ],
  ...rels({
    relation: {
      id: 'N = N₀ × 2^n',
      display: '{N} = {n0} × 2^{n}',
      vars: ['N', 'n0', 'n'],
      residual: (v: Values) => v.N! - v.n0! * 2 ** v.n!,
      solve: {
        N: (v: Values) => v.n0! * 2 ** v.n!,
        n0: (v: Values) => div(v.N!, 2 ** v.n!),
        n: (v: Values) => (v.N! > 0 && v.n0! > 0 ? Math.log2(v.N! / v.n0!) : undefined),
      },
    },
    steps: {
      N: { expr: '{n0} × 2^{n}', how: 'Each cycle doubles the copies: n doublings of N₀.' },
      n0: { expr: '{N} ÷ 2^{n}', how: 'Undo the n doublings: halve N, n times.' },
      n: { expr: 'log_2({N} ÷ {n0})', how: 'How many doublings turn N₀ into N.' },
    },
  }),
  example: { n0: 1, n: 5, N: 32 },
  startWith: ['n0', 'n'],
  representation: { kind: 'gel', pcr: { cycles: 'n', start: 'n0', copies: 'N' } },
};

const pcrMany: ModuleDef = {
  ...pcr,
  id: 'g.s9-biotechnology-pcr-cycles',
  title: 'PCR: a billion copies',
  use: 'Use this for how many PCR cycles make a given number of copies.',
  example: { n0: 10, n: 30, N: 10 * 2 ** 30 },
};

export const HSH_GALLERY_MODULES: ModuleDef[] = [gelCut, gelDouble, gelSmall, pcr, pcrMany];
export const HSH_GALLERY_LAYOUTS: LayoutDef[] = [];
