/**
 * Grades 9–12 round 3 gallery demos (group H3E: chemistry (H108); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in: the built page's
 * own variables, relations, steps and use line (from science/10.ts), with the picture it waits
 * for. Spread into gallery.ts.
 */
import type { LayoutDef } from './layouts';
import { SCIENCE_10_MODULES } from './science/10';
import type { ModuleDef, Representation } from './types';

/** A built page as a demo: its id and title changed, the new picture, and any overrides. */
function fromPage(
  pageId: string,
  id: string,
  title: string,
  representation: Representation,
  more: Partial<ModuleDef> = {},
): ModuleDef {
  const page = SCIENCE_10_MODULES.find((m) => m.id === pageId);
  if (!page) throw new Error(`galleryHs3e: no page ${pageId}`);
  return { ...page, id, title, representation, ...more };
}

// ─── Part 2: an ionic compound from its ions' charges ────────────────────────

/** s.10.bonding~ionic with the ions picked by their charges: Al³⁺ with O²⁻ draws Al₂O₃. */
const ionicCharges = fromPage(
  's.10.bonding~ionic',
  'g.s10-bonding-ionic-charges',
  'An ionic formula from the charges',
  {
    kind: 'lewisStructure',
    mode: 'ionic',
    metal: 'Mg',
    nonmetal: 'Cl',
    metals: 'a',
    nonmetals: 'b',
    transferred: 't',
    charges: { metal: 'cp', nonmetal: 'cn' },
  },
  {
    assumptions: [
      'The metal gives electrons and the nonmetal takes them: the total positive charge equals the total negative charge.',
      'The formula uses the lowest whole-number ratio of ions.',
      'The picture draws Na⁺, Mg²⁺ or Al³⁺ for a charge of 1, 2 or 3, and Cl⁻, O²⁻ or N³⁻ for the nonmetal.',
    ],
    example: { cp: 3, cn: 2, t: 6, a: 2, b: 3 },
  },
);

// ─── Part 3: a phase diagram with the solution's lines shifted ───────────────

/** s.10.phase-colligative on water's phase diagram: the solution's lines dashed, shifted. */
const phaseDiagram = fromPage(
  's.10.phase-colligative',
  'g.s10-phase-colligative-diagram',
  'Freezing and boiling points on the phase diagram',
  {
    kind: 'chemDiagram',
    mode: 'phase',
    freezing: 'Tf',
    boiling: 'Tb',
    drop: 'dTf',
    rise: 'dTb',
  },
);

// ─── Part 4: a concentration–time curve and its secant ───────────────────────

/** s.10.rates-equilibrium~average-rate on a curve through the two readings. */
const averageRate = fromPage(
  's.10.rates-equilibrium~average-rate',
  'g.s10-rates-equilibrium-average-rate-curve',
  'Average rate on a concentration–time curve',
  {
    kind: 'chemDiagram',
    mode: 'rate',
    times: ['t1', 't2'],
    concentrations: ['A1', 'A2'],
    span: 'dt',
    change: 'dA',
    rate: 'r',
  },
);

// ─── Part 5: a galvanic cell as a calculator picture ─────────────────────────

/** s.10.redox~cell-voltage drawing the cell its two potentials make. */
const cellVoltage = fromPage(
  's.10.redox~cell-voltage',
  'g.s10-redox-cell-voltage-cell',
  'Cell voltage with the cell drawn',
  { kind: 'chemDiagram', mode: 'cell', cathode: 'Ec', anode: 'Ea', voltage: 'E' },
);

// ─── Part 6: a gas mixture colored by gas ────────────────────────────────────

/** s.10.gas-laws~partial-pressure with the tank's gases drawn in their own colors. */
const partialPressure = fromPage(
  's.10.gas-laws~partial-pressure',
  'g.s10-gas-laws-partial-pressure-mixture',
  'Partial pressures in a gas mixture',
  {
    kind: 'gasPiston',
    law: 'ideal',
    mixture: {
      gases: [
        { formula: 'He', pressure: 'P1' },
        { formula: 'O2', pressure: 'P2' },
        { formula: 'N2', pressure: 'P3' },
      ],
      total: 'P',
      fraction: 'x',
    },
  },
);

export const HS3E_GALLERY_MODULES: ModuleDef[] = [
  ionicCharges,
  phaseDiagram,
  averageRate,
  cellVoltage,
  partialPressure,
];

export const HS3E_GALLERY_LAYOUTS: LayoutDef[] = [];
