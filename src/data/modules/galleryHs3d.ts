/**
 * Grades 9–12 round 3 gallery demos (group H3D: biology (H109); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

/** A relation and its step text, built together. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

/** A whole-number count. */
const count = (
  id: string,
  symbol: string,
  name: string,
  min = 0,
  max = 40,
  derived = false,
): VariableDef => ({
  id,
  symbol,
  name,
  min,
  max,
  step: 1,
  integer: true,
  ...(derived ? { derived: true } : {}),
});

/** `out` from `ins`, one way only. */
function forward(
  id: string,
  display: string,
  out: string,
  ins: string[],
  f: (v: Values) => number | undefined,
  expr: string,
  how: string,
): Rule {
  return {
    relation: {
      id,
      display,
      vars: [out, ...ins],
      residual: (v: Values) => v[out]! - (f(v) ?? NaN),
      solve: Object.fromEntries([
        [out, f],
        ...ins.map((x) => [x, () => undefined]),
      ]) as Relation['solve'],
    },
    steps: { [out]: { expr, how } },
  };
}

const codonOf = (k: string, p: string): Rule =>
  forward(
    `${k} = ⌈${p} ÷ 3⌉`,
    `{${k}} = ⌈{${p}} ÷ 3⌉`,
    k,
    [p],
    (v) => Math.ceil(v[p]! / 3 - 1e-9),
    `⌈{${p}} ÷ 3⌉`,
    'Bases 1 to 3 are codon 1, bases 4 to 6 codon 2, and so on: divide by 3 and round up.',
  );

const GENE = 'TACCGGTTCATT';

// ─── Part 1: dnaMath start-lost and stop-lost (s.9.biotechnology, ~frameshift) ───────────

const DNA: ModuleDef[] = [
  {
    id: 'g.s9-biotechnology-start-stop',
    title: 'A point mutation, start to stop',
    use: 'Use this for “Base 11 of TACCGGTTCATT changes. What happens to the protein?”',
    assumptions: [
      `The template strand is ${GENE}; its mRNA AUG GCC AAG UAA codes Met–Ala–Lys, then stop.`,
      'Bases 1–3 are the start codon and 10–12 the stop; the base changed swaps A with G or C with T.',
      'A change to AUG loses the start: no protein is made from here. A stop turned into an amino acid loses the stop: the ribosome reads on.',
    ],
    variables: [
      count('p', 'p', 'Base changed', 1, 12),
      count('k', 'k', 'Codon holding it', 1, 4, true),
      count('j', 'j', 'Its place in the codon', 1, 3, true),
    ],
    ...rules(
      codonOf('k', 'p'),
      forward(
        'j = p − 3(k − 1)',
        '{j} = {p} − 3 × ({k} − 1)',
        'j',
        ['p', 'k'],
        (v) => v.p! - 3 * (v.k! - 1),
        '{p} − 3 × ({k} − 1)',
        'The codons before it hold 3 × (k − 1) bases; the rest is its place in its own codon.',
      ),
    ),
    example: { p: 10, k: 4, j: 1 },
    startWith: ['p'],
    representation: {
      kind: 'dnaStrand',
      sequence: GENE,
      mutation: { type: 'substitution', at: 'p' },
    },
  },
  {
    id: 'g.s9-biotechnology-frameshift-start',
    title: 'An insertion at the start codon',
    use: 'Use this for “An A is inserted before base 2. Why is no protein made?”',
    assumptions: [
      `The template strand is ${GENE}; an A is inserted before base p.`,
      'Before base 1 the start codon is untouched; inside it, AUG is broken and no protein starts there.',
      'Past the start, every codon from the one holding the insertion is read in a shifted frame.',
    ],
    variables: [
      count('p', 'p', 'Base the insertion goes before', 1, 12),
      count('k', 'k', 'Codon holding it', 1, 4, true),
    ],
    ...rules(codonOf('k', 'p')),
    example: { p: 2, k: 1 },
    startWith: ['p'],
    representation: {
      kind: 'dnaStrand',
      sequence: GENE,
      mutation: { type: 'insertion', at: 'p', base: 'A' },
    },
  },
];

export const HS3D_GALLERY_MODULES: ModuleDef[] = [...DNA];

export const HS3D_GALLERY_LAYOUTS: LayoutDef[] = [];
