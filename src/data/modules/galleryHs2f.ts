/**
 * Grades 9–12 round 2 gallery demos (group H2F: earth and space (H103); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in: real variables,
 * relations, steps and a use line, so `scripts/promote-demo.mjs` can copy it into a grade file.
 * Spread into gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import { div } from './helpers';
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

type Rel = { relation: Relation; steps: Record<string, StepText> };
type Solve = (v: Values) => number | number[] | undefined;

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

/** A relation from its id, display and residual, and per variable `[solve, expr, how]`. */
const rule = (
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, string, string]>,
): Rel => ({
  relation: {
    id,
    display,
    vars: [
      ...new Set([...Object.keys(parts), ...[...display.matchAll(/\{(\w+)\}/g)].map((x) => x[1]!)]),
    ],
    residual,
    solve: Object.fromEntries(Object.entries(parts).map(([k, p]) => [k, p[0]])),
  },
  steps: Object.fromEntries(Object.entries(parts).map(([k, p]) => [k, { expr: p[1], how: p[2] }])),
});

/** a = b × c, each way round. */
const product = (a: string, b: string, c: string, how: [string, string, string]) =>
  rule(`${a} = ${b} × ${c}`, `{${a}} = {${b}} × {${c}}`, (v) => v[a]! - v[b]! * v[c]!, {
    [a]: [(v) => v[b]! * v[c]!, `{${b}} × {${c}}`, how[0]],
    [b]: [(v) => div(v[a]!, v[c]!), `{${a}} ÷ {${c}}`, how[1]],
    [c]: [(v) => div(v[a]!, v[b]!), `{${a}} ÷ {${b}}`, how[2]],
  });

/** a = b ÷ c, each way round. */
const quotient = (a: string, b: string, c: string, how: [string, string, string]) =>
  rule(`${a} = ${b} ÷ ${c}`, `{${a}} = {${b}} ÷ {${c}}`, (v) => v[a]! * v[c]! - v[b]!, {
    [a]: [(v) => div(v[b]!, v[c]!), `{${b}} ÷ {${c}}`, how[0]],
    [b]: [(v) => v[a]! * v[c]!, `{${a}} × {${c}}`, how[1]],
    [c]: [(v) => div(v[b]!, v[a]!), `{${b}} ÷ {${a}}`, how[2]],
  });

/** a = b − c, each way round. */
const difference = (a: string, b: string, c: string, how: [string, string, string]) =>
  rule(`${a} = ${b} − ${c}`, `{${a}} = {${b}} − {${c}}`, (v) => v[a]! - (v[b]! - v[c]!), {
    [a]: [(v) => v[b]! - v[c]!, `{${b}} − {${c}}`, how[0]],
    [b]: [(v) => v[a]! + v[c]!, `{${a}} + {${c}}`, how[1]],
    [c]: [(v) => v[b]! - v[a]!, `{${b}} − {${a}}`, how[2]],
  });

// Keep the helpers referenced while later parts add their demos.
void product;
void quotient;

// ── Part 1: two seismograms by magnitude (earthLayers mode `magnitude`) ──

const mag = (id: string, symbol: string, name: string) =>
  V(id, symbol, name, { min: 0, max: 10, step: 0.1 });

const magnitude: ModuleDef = {
  id: 'g.s12-earth-interior-magnitude',
  title: 'Comparing earthquakes by magnitude',
  use: 'Use this for “A magnitude 6 quake and a magnitude 4 quake: how much more shaking, and how much more energy?”',
  assumptions: [
    'Magnitude is read from the largest swing of a seismogram, corrected for the station’s distance.',
    'Each step of 1 in magnitude is 10 times the ground motion and about 32 times the energy.',
    'Both quakes are measured on the same magnitude scale.',
  ],
  variables: [
    mag('M1', 'M₁', 'Magnitude of the first quake'),
    mag('M2', 'M₂', 'Magnitude of the second quake'),
    V('d', 'ΔM', 'Difference in magnitude', { min: -10, max: 10, step: 0.1, derived: true }),
    V('A', 'A', 'Amplitude ratio', { min: 1e-10, max: 1e10, step: 0.01, derived: true }),
    V('E', 'E', 'Energy ratio', { min: 1e-15, max: 1e15, step: 0.01, derived: true }),
  ],
  ...rels(
    difference('d', 'M2', 'M1', [
      'How many steps of magnitude apart the two quakes are.',
      'The second quake is ΔM steps above the first.',
      'The first quake is ΔM steps below the second.',
    ]),
    rule('A = 10^ΔM', '{A} = 10^{d}', (v) => Math.log10(v.A!) - v.d!, {
      A: [(v) => 10 ** v.d!, '10^{d}', 'Each step of magnitude is 10 times the ground motion.'],
      d: [
        (v) => (v.A! > 0 ? Math.log10(v.A!) : undefined),
        'log_10({A})',
        'How many factors of 10 make the amplitude ratio.',
      ],
    }),
    rule('E = 10^(1.5 ΔM)', '{E} = 10^(1.5 × {d})', (v) => Math.log10(v.E!) - 1.5 * v.d!, {
      E: [
        (v) => 10 ** (1.5 * v.d!),
        '10^(1.5 × {d})',
        'Each step of magnitude is about 32 times the energy: 10^1.5.',
      ],
      d: [
        (v) => (v.E! > 0 ? Math.log10(v.E!) / 1.5 : undefined),
        'log_10({E}) ÷ 1.5',
        'The energy ratio’s factors of 10, over 1.5 per step.',
      ],
    }),
  ),
  example: { M1: 4, M2: 6, d: 2, A: 100, E: 1000 },
  startWith: ['M1', 'M2'],
  representation: {
    kind: 'earthLayers',
    mode: 'magnitude',
    m1: 'M1',
    m2: 'M2',
    amplitude: 'A',
    energy: 'E',
  },
};

const magnitudeHalf: ModuleDef = {
  ...magnitude,
  id: 'g.s12-earth-interior-magnitude-half',
  title: 'Half a step of magnitude',
  use: 'Use this for quakes less than one magnitude apart, such as 5.5 and 6.',
  example: { M1: 5.5, M2: 6, d: 0.5, A: 10 ** 0.5, E: 10 ** 0.75 },
};

const magnitudeFar: ModuleDef = {
  ...magnitude,
  id: 'g.s12-earth-interior-magnitude-far',
  title: 'A great quake beside a small one',
  use: 'Use this for quakes far apart on the scale, such as 3 and 8.',
  example: { M1: 3, M2: 8, d: 5, A: 1e5, E: 10 ** 7.5 },
};

export const HS2F_GALLERY_MODULES: ModuleDef[] = [magnitude, magnitudeHalf, magnitudeFar];

export const HS2F_GALLERY_LAYOUTS: LayoutDef[] = [];
