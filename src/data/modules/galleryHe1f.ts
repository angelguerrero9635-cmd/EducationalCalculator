/**
 * College gallery demos, round 1, group F (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC5 `controlVolume`: material and energy balances (docs/plans/he.aero-civil-chemical.md,
 * P9) and steady-flow devices (docs/plans/he.mechanical.md, P11).
 */
import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation } from './types';

const div = (a: number, b: number) => (b === 0 ? undefined : a / b);

/** A demo module: the shared fields filled in (college pages show 4 figures). */
const demo = (m: Omit<ModuleDef, 'workedFigures'> & { workedFigures?: number }): ModuleDef => ({
  workedFigures: 4,
  ...m,
});

// ── HC5: a single stream (material-energy-balances#0) ──

const benzene = (() => {
  const [m, wA, MA, MB] = [100, 0.4, 78.11, 92.14];
  const nA = (wA * m) / MA;
  const nB = ((1 - wA) * m) / MB;
  const n = nA + nB;
  return { m, wA, MA, MB, nA, nB, n, xA: nA / n };
})();

const streamDemo = demo({
  id: 'g.he-controlVolume-stream',
  title: 'A stream: mass flow to molar flows and mole fraction',
  use: 'Use this for “100 kg/h of 40% benzene and toluene: what are the molar flows and the mole fraction of benzene?”',
  assumptions: [
    'Two components, benzene (A) and toluene (B); their mass fractions add to 1.',
    'Molar flow = mass flow ÷ molar mass, one component at a time.',
  ],
  variables: [
    { id: 'm', symbol: 'ṁ', name: 'Total mass flow', unit: 'kg/h', min: 0.001, max: 1e7 },
    { id: 'wA', symbol: 'w_A', name: 'Mass fraction of benzene', min: 0, max: 1, step: 0.01 },
    { id: 'MA', symbol: 'M_A', name: 'Molar mass of benzene', unit: 'kg/kmol', min: 1, max: 1000 },
    { id: 'MB', symbol: 'M_B', name: 'Molar mass of toluene', unit: 'kg/kmol', min: 1, max: 1000 },
    { id: 'nA', symbol: 'ṅ_A', name: 'Molar flow of benzene', unit: 'kmol/h', min: 0, max: 1e7 },
    { id: 'nB', symbol: 'ṅ_B', name: 'Molar flow of toluene', unit: 'kmol/h', min: 0, max: 1e7 },
    { id: 'n', symbol: 'ṅ', name: 'Total molar flow', unit: 'kmol/h', min: 0, max: 1e7 },
    { id: 'xA', symbol: 'x_A', name: 'Mole fraction of benzene', min: 0, max: 1 },
  ],
  relations: [
    {
      id: 'ṅ_A = w_Aṁ ÷ M_A',
      display: '{nA} = {wA} × {m} ÷ {MA}',
      vars: ['nA', 'wA', 'm', 'MA'],
      residual: (x) => x.nA! * x.MA! - x.wA! * x.m!,
      solve: {
        nA: (x) => div(x.wA! * x.m!, x.MA!),
        wA: (x) => div(x.nA! * x.MA!, x.m!),
        m: (x) => div(x.nA! * x.MA!, x.wA!),
        MA: (x) => div(x.wA! * x.m!, x.nA!),
      },
    },
    {
      id: 'ṅ_B = (1 − w_A)ṁ ÷ M_B',
      display: '{nB} = (1 − {wA}) × {m} ÷ {MB}',
      vars: ['nB', 'wA', 'm', 'MB'],
      residual: (x) => x.nB! * x.MB! - (1 - x.wA!) * x.m!,
      solve: {
        nB: (x) => div((1 - x.wA!) * x.m!, x.MB!),
        wA: (x) => (x.m === 0 ? undefined : 1 - (x.nB! * x.MB!) / x.m!),
        m: (x) => div(x.nB! * x.MB!, 1 - x.wA!),
        MB: (x) => div((1 - x.wA!) * x.m!, x.nB!),
      },
    },
    {
      id: 'ṅ = ṅ_A + ṅ_B',
      display: '{n} = {nA} + {nB}',
      vars: ['n', 'nA', 'nB'],
      residual: (x) => x.n! - x.nA! - x.nB!,
      solve: {
        n: (x) => x.nA! + x.nB!,
        nA: (x) => x.n! - x.nB!,
        nB: (x) => x.n! - x.nA!,
      },
    },
    {
      id: 'x_A = ṅ_A ÷ ṅ',
      display: '{xA} = {nA} ÷ {n}',
      vars: ['xA', 'nA', 'n'],
      residual: (x) => x.xA! * x.n! - x.nA!,
      solve: {
        xA: (x) => div(x.nA!, x.n!),
        nA: (x) => x.xA! * x.n!,
        n: (x) => div(x.nA!, x.xA!),
      },
    },
  ],
  steps: {
    'ṅ_A = w_Aṁ ÷ M_A': {
      nA: { expr: '{wA} × {m} ÷ {MA}', how: 'The benzene’s mass flow, divided by its molar mass.' },
      wA: { expr: '{nA} × {MA} ÷ {m}', how: 'Turn the benzene back into mass, then divide by ṁ.' },
      m: { expr: '{nA} × {MA} ÷ {wA}', how: 'Multiply by M_A, then divide by the mass fraction.' },
      MA: { expr: '{wA} × {m} ÷ {nA}', how: 'Mass of benzene per kmol of it.' },
    },
    'ṅ_B = (1 − w_A)ṁ ÷ M_B': {
      nB: {
        expr: '(1 − {wA}) × {m} ÷ {MB}',
        how: 'The rest of the stream is toluene: its mass flow over its molar mass.',
      },
      wA: { expr: '1 − {nB} × {MB} ÷ {m}', how: 'Take the toluene’s share of the mass from 1.' },
      m: { expr: '{nB} × {MB} ÷ (1 − {wA})', how: 'Toluene’s mass flow over its share.' },
      MB: { expr: '(1 − {wA}) × {m} ÷ {nB}', how: 'Mass of toluene per kmol of it.' },
    },
    'ṅ = ṅ_A + ṅ_B': {
      n: { expr: '{nA} + {nB}', how: 'Add the two molar flows.' },
      nA: { expr: '{n} − {nB}', how: 'Subtract the toluene from the total.' },
      nB: { expr: '{n} − {nA}', how: 'Subtract the benzene from the total.' },
    },
    'x_A = ṅ_A ÷ ṅ': {
      xA: { expr: '{nA} ÷ {n}', how: 'The benzene’s share of the moles.' },
      nA: { expr: '{xA} × {n}', how: 'Multiply the total by the mole fraction.' },
      n: { expr: '{nA} ÷ {xA}', how: 'Divide the benzene by its mole fraction.' },
    },
  },
  example: benzene,
  startWith: ['m', 'wA', 'MA', 'MB'],
  representation: {
    kind: 'controlVolume',
    unit: 'stream',
    streams: [
      {
        name: 'Benzene and toluene',
        dir: 'in',
        flow: 'm',
        fractions: [{ name: 'benzene', x: 'wA' }],
        rest: 'toluene',
        more: ['nA', 'nB', 'n', 'xA'],
      },
    ],
  },
});

// ── HC5: degrees of freedom of a splitter (material-energy-balances#0~dof) ──

const dofDemo = demo({
  id: 'g.he-controlVolume-dof',
  title: 'Degrees of freedom of a splitter',
  use: 'Use this for “A splitter has 5 unknowns, 2 balances, 2 specified values and 1 split relation. Can it be solved?”',
  assumptions: [
    'The feed is 100 kg/h, the basis; the other flows and fractions are unknown (lit).',
    'Two components give two independent balances. A splitter’s outlets have the feed’s composition.',
    'DOF > 0 needs more information; DOF < 0 is over-specified or inconsistent.',
  ],
  variables: [
    { id: 'U', symbol: 'N_u', name: 'Unknowns', min: 0, max: 50, integer: true },
    { id: 'B', symbol: 'N_b', name: 'Independent balances', min: 0, max: 50, integer: true },
    { id: 'S', symbol: 'N_s', name: 'Specified values', min: 0, max: 50, integer: true },
    { id: 'R', symbol: 'N_r', name: 'Other relations', min: 0, max: 50, integer: true },
    { id: 'DOF', symbol: 'DOF', name: 'Degrees of freedom', min: -50, max: 50, integer: true },
  ],
  relations: [
    {
      id: 'DOF = N_u − N_b − N_s − N_r',
      display: '{DOF} = {U} − {B} − {S} − {R}',
      vars: ['DOF', 'U', 'B', 'S', 'R'],
      residual: (x) => x.DOF! - x.U! + x.B! + x.S! + x.R!,
      solve: {
        DOF: (x) => x.U! - x.B! - x.S! - x.R!,
        U: (x) => x.DOF! + x.B! + x.S! + x.R!,
        B: (x) => x.U! - x.DOF! - x.S! - x.R!,
        S: (x) => x.U! - x.B! - x.DOF! - x.R!,
        R: (x) => x.U! - x.B! - x.S! - x.DOF!,
      },
    },
  ],
  steps: {
    'DOF = N_u − N_b − N_s − N_r': {
      DOF: {
        expr: '{U} − {B} − {S} − {R}',
        how: 'Each equation or specified value pins one unknown; what is left is free.',
      },
      U: { expr: '{DOF} + {B} + {S} + {R}', how: 'Add the equations back to the free count.' },
      B: { expr: '{U} − {DOF} − {S} − {R}', how: 'Take the rest from the unknowns.' },
      S: { expr: '{U} − {B} − {DOF} − {R}', how: 'Take the rest from the unknowns.' },
      R: { expr: '{U} − {B} − {S} − {DOF}', how: 'Take the rest from the unknowns.' },
    },
  },
  example: { U: 5, B: 2, S: 2, R: 1, DOF: 0 },
  startWith: ['U', 'B', 'S', 'R'],
  representation: {
    kind: 'controlVolume',
    unit: 'splitter',
    streams: [
      {
        name: 'Feed',
        dir: 'in',
        tags: [{ text: 'F = 100 kg/h' }, { text: 'x_F', unknown: true }],
      },
      {
        name: 'Outlet 1',
        dir: 'out',
        tags: [
          { text: 'S₁', unknown: true },
          { text: 'x₁', unknown: true },
        ],
      },
      {
        name: 'Outlet 2',
        dir: 'out',
        tags: [
          { text: 'S₂', unknown: true },
          { text: 'x₂', unknown: true },
        ],
      },
    ],
    dof: { unknowns: 'U', balances: 'B', specs: 'S', relations: 'R', dof: 'DOF' },
  },
});

// ── HC5: a mixer (material-energy-balances#1) ──

const mixerDemo = demo({
  id: 'g.he-controlVolume-mixer',
  title: 'A mixer: outlet flow and composition',
  use: 'Use this for “100 kg/h of 20% ethanol meets 50 kg/h of 50% ethanol. What leaves?”',
  assumptions: [
    'Steady state and no reaction, so what goes in comes out, for each component.',
    'Fractions are mass fractions of ethanol; the rest is water.',
  ],
  variables: [
    { id: 'F1', symbol: 'F₁', name: 'Feed 1 flow', unit: 'kg/h', min: 0, max: 1e7 },
    { id: 'x1', symbol: 'x₁', name: 'Feed 1 ethanol fraction', min: 0, max: 1, step: 0.01 },
    { id: 'F2', symbol: 'F₂', name: 'Feed 2 flow', unit: 'kg/h', min: 0, max: 1e7 },
    { id: 'x2', symbol: 'x₂', name: 'Feed 2 ethanol fraction', min: 0, max: 1, step: 0.01 },
    { id: 'F3', symbol: 'F₃', name: 'Product flow', unit: 'kg/h', min: 0, max: 2e7 },
    { id: 'x3', symbol: 'x₃', name: 'Product ethanol fraction', min: 0, max: 1 },
  ],
  relations: [
    {
      id: 'F₁ + F₂ = F₃',
      display: '{F1} + {F2} = {F3}',
      vars: ['F3', 'F1', 'F2'],
      residual: (x) => x.F1! + x.F2! - x.F3!,
      solve: {
        F3: (x) => x.F1! + x.F2!,
        F1: (x) => x.F3! - x.F2!,
        F2: (x) => x.F3! - x.F1!,
      },
    },
    {
      id: 'F₁x₁ + F₂x₂ = F₃x₃',
      display: '{F1} × {x1} + {F2} × {x2} = {F3} × {x3}',
      vars: ['x3', 'F1', 'x1', 'F2', 'x2', 'F3'],
      residual: (x) => x.F1! * x.x1! + x.F2! * x.x2! - x.F3! * x.x3!,
      solve: {
        x3: (x) => div(x.F1! * x.x1! + x.F2! * x.x2!, x.F3!),
        x1: (x) => div(x.F3! * x.x3! - x.F2! * x.x2!, x.F1!),
        x2: (x) => div(x.F3! * x.x3! - x.F1! * x.x1!, x.F2!),
        F1: (x) => div(x.F3! * x.x3! - x.F2! * x.x2!, x.x1!),
        F2: (x) => div(x.F3! * x.x3! - x.F1! * x.x1!, x.x2!),
        F3: (x) => div(x.F1! * x.x1! + x.F2! * x.x2!, x.x3!),
      },
    },
  ],
  steps: {
    'F₁ + F₂ = F₃': {
      F3: { expr: '{F1} + {F2}', how: 'Total in equals total out: add the two feeds.' },
      F1: { expr: '{F3} − {F2}', how: 'Take feed 2 from the product.' },
      F2: { expr: '{F3} − {F1}', how: 'Take feed 1 from the product.' },
    },
    'F₁x₁ + F₂x₂ = F₃x₃': {
      x3: {
        expr: '({F1} × {x1} + {F2} × {x2}) ÷ {F3}',
        how: 'The ethanol in, shared over the product’s flow.',
      },
      x1: {
        expr: '({F3} × {x3} − {F2} × {x2}) ÷ {F1}',
        how: 'Feed 1 brings the ethanol not from feed 2.',
      },
      x2: {
        expr: '({F3} × {x3} − {F1} × {x1}) ÷ {F2}',
        how: 'Feed 2 brings the ethanol not from feed 1.',
      },
      F1: {
        expr: '({F3} × {x3} − {F2} × {x2}) ÷ {x1}',
        how: 'Feed 1’s ethanol over its fraction.',
      },
      F2: {
        expr: '({F3} × {x3} − {F1} × {x1}) ÷ {x2}',
        how: 'Feed 2’s ethanol over its fraction.',
      },
      F3: { expr: '({F1} × {x1} + {F2} × {x2}) ÷ {x3}', how: 'The ethanol out over its fraction.' },
    },
  },
  example: { F1: 100, x1: 0.2, F2: 50, x2: 0.5, F3: 150, x3: 0.3 },
  startWith: ['F1', 'x1', 'F2', 'x2'],
  representation: {
    kind: 'controlVolume',
    unit: 'mixer',
    streams: [
      {
        name: 'Feed 1',
        dir: 'in',
        flow: 'F1',
        fractions: [{ name: 'ethanol', x: 'x1' }],
        rest: 'water',
      },
      {
        name: 'Feed 2',
        dir: 'in',
        flow: 'F2',
        fractions: [{ name: 'ethanol', x: 'x2' }],
        rest: 'water',
      },
      {
        name: 'Product',
        dir: 'out',
        flow: 'F3',
        fractions: [{ name: 'ethanol', x: 'x3' }],
        rest: 'water',
      },
    ],
  },
});

// ── HC5: a distillation column's split (material-energy-balances#1~splitter) ──

const column = (() => {
  const [F, z, xD, xB] = [100, 0.4, 0.95, 0.05];
  const D = (F * (z - xB)) / (xD - xB);
  const B = F - D;
  return { F, z, xD, xB, D, B, rec: ((D * xD) / (F * z)) * 100 };
})();

const columnDemo = demo({
  id: 'g.he-controlVolume-column',
  title: 'A column’s split: distillate, bottoms and recovery',
  use: 'Use this for “100 kmol/h at 40% light key splits to 95% and 5%. What are D, B and the recovery?”',
  assumptions: [
    'Steady state; the column only separates (no reaction).',
    'Two components, the light key and the heavy key; fractions are mole fractions.',
    'The lever rule comes from the total and the light-key balances together.',
  ],
  variables: [
    { id: 'F', symbol: 'F', name: 'Feed flow', unit: 'kmol/h', min: 0.001, max: 1e7 },
    { id: 'z', symbol: 'z', name: 'Feed light-key fraction', min: 0, max: 1, step: 0.01 },
    { id: 'xD', symbol: 'x_D', name: 'Distillate light-key fraction', min: 0, max: 1, step: 0.01 },
    { id: 'xB', symbol: 'x_B', name: 'Bottoms light-key fraction', min: 0, max: 1, step: 0.01 },
    { id: 'D', symbol: 'D', name: 'Distillate flow', unit: 'kmol/h', min: 0, max: 1e7 },
    { id: 'B', symbol: 'B', name: 'Bottoms flow', unit: 'kmol/h', min: 0, max: 1e7 },
    { id: 'rec', symbol: 'r', name: 'Light-key recovery overhead', unit: '%', min: 0, max: 100 },
  ],
  relations: [
    {
      id: 'F = D + B',
      display: '{F} = {D} + {B}',
      vars: ['B', 'F', 'D'],
      residual: (x) => x.F! - x.D! - x.B!,
      solve: { B: (x) => x.F! - x.D!, F: (x) => x.D! + x.B!, D: (x) => x.F! - x.B! },
    },
    {
      id: 'D = F(z − x_B) ÷ (x_D − x_B)',
      display: '{D} = {F} × ({z} − {xB}) ÷ ({xD} − {xB})',
      vars: ['D', 'F', 'z', 'xB', 'xD'],
      residual: (x) => x.D! * (x.xD! - x.xB!) - x.F! * (x.z! - x.xB!),
      solve: {
        D: (x) => div(x.F! * (x.z! - x.xB!), x.xD! - x.xB!),
        F: (x) => div(x.D! * (x.xD! - x.xB!), x.z! - x.xB!),
        z: (x) => (x.F === 0 ? undefined : x.xB! + (x.D! * (x.xD! - x.xB!)) / x.F!),
        xD: (x) => (x.D === 0 ? undefined : x.xB! + (x.F! * (x.z! - x.xB!)) / x.D!),
        xB: (x) => div(x.F! * x.z! - x.D! * x.xD!, x.F! - x.D!),
      },
    },
    {
      id: 'r = Dx_D ÷ (Fz) × 100',
      display: '{rec} = {D} × {xD} ÷ ({F} × {z}) × 100',
      vars: ['rec', 'D', 'xD', 'F', 'z'],
      residual: (x) => x.rec! * x.F! * x.z! - 100 * x.D! * x.xD!,
      solve: {
        rec: (x) => div(100 * x.D! * x.xD!, x.F! * x.z!),
        D: (x) => div(x.rec! * x.F! * x.z!, 100 * x.xD!),
        xD: (x) => div(x.rec! * x.F! * x.z!, 100 * x.D!),
        F: (x) => div(100 * x.D! * x.xD!, x.rec! * x.z!),
        z: (x) => div(100 * x.D! * x.xD!, x.rec! * x.F!),
      },
    },
  ],
  steps: {
    'F = D + B': {
      B: { expr: '{F} − {D}', how: 'What doesn’t leave overhead leaves at the bottom.' },
      F: { expr: '{D} + {B}', how: 'Total in equals total out.' },
      D: { expr: '{F} − {B}', how: 'Take the bottoms from the feed.' },
    },
    'D = F(z − x_B) ÷ (x_D − x_B)': {
      D: {
        expr: '{F} × ({z} − {xB}) ÷ ({xD} − {xB})',
        how: 'Put B = F − D into the light-key balance Fz = Dx_D + Bx_B and solve for D.',
      },
      F: {
        expr: '{D} × ({xD} − {xB}) ÷ ({z} − {xB})',
        how: 'Multiply across, then divide by z − x_B.',
      },
      z: { expr: '{xB} + {D} × ({xD} − {xB}) ÷ {F}', how: 'Undo the division, then add x_B.' },
      xD: { expr: '{xB} + {F} × ({z} − {xB}) ÷ {D}', how: 'Multiply across, then add x_B.' },
      xB: {
        expr: '({F} × {z} − {D} × {xD}) ÷ ({F} − {D})',
        how: 'The light key left for the bottoms, over the bottoms’ flow.',
      },
    },
    'r = Dx_D ÷ (Fz) × 100': {
      rec: {
        expr: '{D} × {xD} ÷ ({F} × {z}) × 100',
        how: 'The light key overhead as a share of the light key fed.',
      },
      D: { expr: '{rec} × {F} × {z} ÷ (100 × {xD})', how: 'The light key overhead, over x_D.' },
      xD: { expr: '{rec} × {F} × {z} ÷ (100 × {D})', how: 'The light key overhead, over D.' },
      F: {
        expr: '100 × {D} × {xD} ÷ ({rec} × {z})',
        how: 'Divide the light key overhead by r and z.',
      },
      z: {
        expr: '100 × {D} × {xD} ÷ ({rec} × {F})',
        how: 'Divide the light key overhead by r and F.',
      },
    },
  },
  example: column,
  startWith: ['F', 'z', 'xD', 'xB'],
  representation: {
    kind: 'controlVolume',
    unit: 'column',
    streams: [
      { name: 'Feed', dir: 'in', flow: 'F', fractions: [{ name: 'light', x: 'z' }], rest: 'heavy' },
      {
        name: 'Distillate',
        dir: 'out',
        flow: 'D',
        fractions: [{ name: 'light', x: 'xD' }],
        rest: 'heavy',
      },
      {
        name: 'Bottoms',
        dir: 'out',
        flow: 'B',
        fractions: [{ name: 'light', x: 'xB' }],
        rest: 'heavy',
      },
    ],
    recovery: 'rec',
    recoveryPercent: true,
  },
});

// ── HC5: an evaporator with a bypass (material-energy-balances#1~bypass) ──

const juice = (() => {
  const [Ff, xf, xc, xp] = [100, 0.12, 0.58, 0.42];
  const P = (Ff * xf) / xp;
  const W = Ff - P;
  const E = W / (1 - xf / xc);
  return { Ff, xf, xc, xp, P, W, E, Bp: Ff - E };
})();

const bypassDemo = demo({
  id: 'g.he-controlVolume-bypass',
  title: 'An evaporator with a bypass',
  use: 'Use this for “Juice at 12% solids is concentrated to 58%, then blended back with bypassed juice to 42%. How much bypasses?”',
  assumptions: [
    'Steady state. The evaporator removes pure water; the solids all stay in the liquid.',
    'The bypass has the fresh feed’s composition; it joins the concentrate at the mixing point.',
    'Balances: the whole process (solids and total), the split, and the evaporator’s water.',
  ],
  variables: [
    { id: 'Ff', symbol: 'F', name: 'Fresh feed', unit: 'kg/h', min: 0.001, max: 1e7 },
    { id: 'xf', symbol: 'x_f', name: 'Feed solids fraction', min: 0, max: 1, step: 0.01 },
    { id: 'xc', symbol: 'x_c', name: 'Concentrate solids fraction', min: 0.01, max: 1, step: 0.01 },
    { id: 'xp', symbol: 'x_p', name: 'Product solids fraction', min: 0, max: 1, step: 0.01 },
    { id: 'P', symbol: 'P', name: 'Product', unit: 'kg/h', min: 0, max: 1e7 },
    { id: 'W', symbol: 'W', name: 'Water evaporated', unit: 'kg/h', min: 0, max: 1e7 },
    { id: 'E', symbol: 'E', name: 'Evaporator feed', unit: 'kg/h', min: 0, max: 1e7 },
    { id: 'Bp', symbol: 'B', name: 'Bypass', unit: 'kg/h', min: 0, max: 1e7 },
  ],
  relations: [
    {
      id: 'Fx_f = Px_p',
      display: '{Ff} × {xf} = {P} × {xp}',
      vars: ['P', 'Ff', 'xf', 'xp'],
      residual: (x) => x.Ff! * x.xf! - x.P! * x.xp!,
      solve: {
        P: (x) => div(x.Ff! * x.xf!, x.xp!),
        Ff: (x) => div(x.P! * x.xp!, x.xf!),
        xf: (x) => div(x.P! * x.xp!, x.Ff!),
        xp: (x) => div(x.Ff! * x.xf!, x.P!),
      },
    },
    {
      id: 'F = W + P',
      display: '{Ff} = {W} + {P}',
      vars: ['W', 'Ff', 'P'],
      residual: (x) => x.Ff! - x.W! - x.P!,
      solve: { W: (x) => x.Ff! - x.P!, Ff: (x) => x.W! + x.P!, P: (x) => x.Ff! - x.W! },
    },
    {
      id: 'W = E(1 − x_f ÷ x_c)',
      display: '{W} = {E} × (1 − {xf} ÷ {xc})',
      vars: ['E', 'W', 'xf', 'xc'],
      residual: (x) => x.W! * x.xc! - x.E! * (x.xc! - x.xf!),
      solve: {
        E: (x) => div(x.W! * x.xc!, x.xc! - x.xf!),
        W: (x) => div(x.E! * (x.xc! - x.xf!), x.xc!),
        xf: (x) => (x.E === 0 ? undefined : x.xc! * (1 - x.W! / x.E!)),
        xc: (x) => (x.E === 0 ? undefined : div(x.xf!, 1 - x.W! / x.E!)),
      },
    },
    {
      id: 'F = B + E',
      display: '{Ff} = {Bp} + {E}',
      vars: ['Bp', 'Ff', 'E'],
      residual: (x) => x.Ff! - x.Bp! - x.E!,
      solve: { Bp: (x) => x.Ff! - x.E!, Ff: (x) => x.Bp! + x.E!, E: (x) => x.Ff! - x.Bp! },
    },
  ],
  steps: {
    'Fx_f = Px_p': {
      P: { expr: '{Ff} × {xf} ÷ {xp}', how: 'All the solids fed leave in the product.' },
      Ff: { expr: '{P} × {xp} ÷ {xf}', how: 'The product’s solids came in with the feed.' },
      xf: { expr: '{P} × {xp} ÷ {Ff}', how: 'The product’s solids, over the feed.' },
      xp: { expr: '{Ff} × {xf} ÷ {P}', how: 'The feed’s solids, over the product.' },
    },
    'F = W + P': {
      W: { expr: '{Ff} − {P}', how: 'What doesn’t leave as product leaves as vapour.' },
      Ff: { expr: '{W} + {P}', how: 'Total in equals total out.' },
      P: { expr: '{Ff} − {W}', how: 'Take the water removed from the feed.' },
    },
    'W = E(1 − x_f ÷ x_c)': {
      E: {
        expr: '{W} × {xc} ÷ ({xc} − {xf})',
        how: 'The evaporator’s solids go from E at x_f to E × x_f ÷ x_c; the difference is W.',
      },
      W: { expr: '{E} × ({xc} − {xf}) ÷ {xc}', how: 'The evaporator feed less its concentrate.' },
      xf: { expr: '{xc} × (1 − {W} ÷ {E})', how: 'Undo the bracket, then multiply by x_c.' },
      xc: {
        expr: '{xf} ÷ (1 − {W} ÷ {E})',
        how: 'The concentrate is E − W, holding E × x_f of solids.',
      },
    },
    'F = B + E': {
      Bp: { expr: '{Ff} − {E}', how: 'The feed not sent to the evaporator bypasses it.' },
      Ff: { expr: '{Bp} + {E}', how: 'The split: the two parts make the feed.' },
      E: { expr: '{Ff} − {Bp}', how: 'Take the bypass from the feed.' },
    },
  },
  example: juice,
  startWith: ['Ff', 'xf', 'xc', 'xp'],
  representation: {
    kind: 'controlVolume',
    unit: 'evaporator',
    bypass: true,
    streams: [
      {
        name: 'Fresh feed',
        dir: 'in',
        flow: 'Ff',
        fractions: [{ name: 'solids', x: 'xf' }],
        rest: 'water',
      },
      { name: 'Vapour', dir: 'out', flow: 'W', fractions: [], rest: 'water' },
      {
        name: 'Product',
        dir: 'out',
        flow: 'P',
        fractions: [{ name: 'solids', x: 'xp' }],
        rest: 'water',
      },
      { name: 'Bypass', dir: 'inside', flow: 'Bp', fractions: [{ name: 'solids', x: 'xf' }] },
      { name: 'Evaporator feed', dir: 'inside', flow: 'E' },
      { name: 'Concentrate', dir: 'inside', fractions: [{ name: 'solids', x: 'xc' }] },
    ],
  },
});

// ── HC5: a methane burner with excess air (material-energy-balances#2~combustion) ──

const methane = (() => {
  const [nF, ex] = [100, 20];
  const nO2 = 2 * nF * (1 + ex / 100);
  const nN2 = 3.76 * nO2;
  const nCO2 = nF;
  const nH2O = 2 * nF;
  const nO2out = nO2 - 2 * nF;
  return { nF, ex, nO2, nN2, nCO2, nH2O, nO2out, y: (100 * nCO2) / (nCO2 + nO2out + nN2) };
})();

const combustionDemo = demo({
  id: 'g.he-controlVolume-combustion',
  title: 'A burner: methane with excess air',
  use: 'Use this for “100 mol/h of methane burns in 20% excess air. What is the CO₂ % on a dry basis?”',
  assumptions: [
    'Complete combustion: CH₄ + 2O₂ → CO₂ + 2H₂O, so the extent equals the methane fed.',
    'Air is 21% O₂ and 79% N₂: 3.76 mol of N₂ per mol of O₂. N₂ passes through.',
    'Dry basis: the water is condensed out before the gas is analysed.',
  ],
  variables: [
    { id: 'nF', symbol: 'ṅ_CH₄', name: 'Methane fed', unit: 'mol/h', min: 0.001, max: 1e7 },
    { id: 'ex', symbol: 'e', name: 'Excess air', unit: '%', min: 0, max: 500 },
    { id: 'nO2', symbol: 'ṅ_O₂', name: 'Oxygen fed', unit: 'mol/h', min: 0, max: 1e8 },
    { id: 'nN2', symbol: 'ṅ_N₂', name: 'Nitrogen fed', unit: 'mol/h', min: 0, max: 1e9 },
    { id: 'nCO2', symbol: 'ṅ_CO₂', name: 'Carbon dioxide out', unit: 'mol/h', min: 0, max: 1e7 },
    { id: 'nH2O', symbol: 'ṅ_H₂O', name: 'Water out', unit: 'mol/h', min: 0, max: 1e8 },
    { id: 'nO2out', symbol: 'ṅ_O₂,out', name: 'Oxygen left', unit: 'mol/h', min: 0, max: 1e8 },
    { id: 'y', symbol: 'y_CO₂', name: 'Dry CO₂ share', unit: '%', min: 0, max: 100 },
  ],
  relations: [
    {
      id: 'ṅ_O₂ = 2ṅ_CH₄(1 + e ÷ 100)',
      display: '{nO2} = 2 × {nF} × (1 + {ex} ÷ 100)',
      vars: ['nO2', 'nF', 'ex'],
      residual: (x) => x.nO2! - 2 * x.nF! * (1 + x.ex! / 100),
      solve: {
        nO2: (x) => 2 * x.nF! * (1 + x.ex! / 100),
        nF: (x) => div(x.nO2!, 2 * (1 + x.ex! / 100)),
        ex: (x) => (x.nF === 0 ? undefined : 100 * (x.nO2! / (2 * x.nF!) - 1)),
      },
    },
    {
      id: 'ṅ_N₂ = 3.76ṅ_O₂',
      display: '{nN2} = 3.76 × {nO2}',
      vars: ['nN2', 'nO2'],
      residual: (x) => x.nN2! - 3.76 * x.nO2!,
      solve: { nN2: (x) => 3.76 * x.nO2!, nO2: (x) => x.nN2! / 3.76 },
    },
    {
      id: 'ṅ_CO₂ = ṅ_CH₄',
      display: '{nCO2} = {nF}',
      vars: ['nCO2', 'nF'],
      residual: (x) => x.nCO2! - x.nF!,
      solve: { nCO2: (x) => x.nF!, nF: (x) => x.nCO2! },
    },
    {
      id: 'ṅ_H₂O = 2ṅ_CH₄',
      display: '{nH2O} = 2 × {nF}',
      vars: ['nH2O', 'nF'],
      residual: (x) => x.nH2O! - 2 * x.nF!,
      solve: { nH2O: (x) => 2 * x.nF!, nF: (x) => x.nH2O! / 2 },
    },
    {
      id: 'ṅ_O₂,out = ṅ_O₂ − 2ṅ_CH₄',
      display: '{nO2out} = {nO2} − 2 × {nF}',
      vars: ['nO2out', 'nO2', 'nF'],
      residual: (x) => x.nO2out! - x.nO2! + 2 * x.nF!,
      solve: {
        nO2out: (x) => x.nO2! - 2 * x.nF!,
        nO2: (x) => x.nO2out! + 2 * x.nF!,
        nF: (x) => (x.nO2! - x.nO2out!) / 2,
      },
    },
    {
      id: 'y_CO₂ = 100ṅ_CO₂ ÷ (ṅ_CO₂ + ṅ_O₂,out + ṅ_N₂)',
      display: '{y} = 100 × {nCO2} ÷ ({nCO2} + {nO2out} + {nN2})',
      vars: ['y', 'nCO2', 'nO2out', 'nN2'],
      residual: (x) => x.y! * (x.nCO2! + x.nO2out! + x.nN2!) - 100 * x.nCO2!,
      solve: {
        y: (x) => div(100 * x.nCO2!, x.nCO2! + x.nO2out! + x.nN2!),
        nCO2: (x) => div(x.y! * (x.nO2out! + x.nN2!), 100 - x.y!),
        nO2out: (x) => (x.y === 0 ? undefined : (100 * x.nCO2!) / x.y! - x.nCO2! - x.nN2!),
        nN2: (x) => (x.y === 0 ? undefined : (100 * x.nCO2!) / x.y! - x.nCO2! - x.nO2out!),
      },
    },
  ],
  steps: {
    'ṅ_O₂ = 2ṅ_CH₄(1 + e ÷ 100)': {
      nO2: {
        expr: '2 × {nF} × (1 + {ex} ÷ 100)',
        how: 'Each CH₄ needs 2 O₂; the excess adds its percent on top.',
      },
      nF: {
        expr: '{nO2} ÷ (2 × (1 + {ex} ÷ 100))',
        how: 'Divide the oxygen by 2 and the excess factor.',
      },
      ex: {
        expr: '100 × ({nO2} ÷ (2 × {nF}) − 1)',
        how: 'How far the oxygen fed passes what burning needs.',
      },
    },
    'ṅ_N₂ = 3.76ṅ_O₂': {
      nN2: { expr: '3.76 × {nO2}', how: 'Air brings 3.76 mol of N₂ with each mol of O₂.' },
      nO2: { expr: '{nN2} ÷ 3.76', how: 'Divide the nitrogen by 3.76.' },
    },
    'ṅ_CO₂ = ṅ_CH₄': {
      nCO2: { expr: '{nF}', how: 'Each CH₄ burned makes one CO₂.' },
      nF: { expr: '{nCO2}', how: 'One CH₄ for each CO₂.' },
    },
    'ṅ_H₂O = 2ṅ_CH₄': {
      nH2O: { expr: '2 × {nF}', how: 'Each CH₄ burned makes two H₂O.' },
      nF: { expr: '{nH2O} ÷ 2', how: 'Half as much CH₄ as water.' },
    },
    'ṅ_O₂,out = ṅ_O₂ − 2ṅ_CH₄': {
      nO2out: { expr: '{nO2} − 2 × {nF}', how: 'The oxygen not used by the burning leaves.' },
      nO2: { expr: '{nO2out} + 2 × {nF}', how: 'Add the oxygen used back to what is left.' },
      nF: { expr: '({nO2} − {nO2out}) ÷ 2', how: 'The oxygen used, two per CH₄.' },
    },
    'y_CO₂ = 100ṅ_CO₂ ÷ (ṅ_CO₂ + ṅ_O₂,out + ṅ_N₂)': {
      y: {
        expr: '100 × {nCO2} ÷ ({nCO2} + {nO2out} + {nN2})',
        how: 'The CO₂ as a percent of the dry gas, the water left out.',
      },
      nCO2: {
        expr: '{y} × ({nO2out} + {nN2}) ÷ (100 − {y})',
        how: 'Gather the CO₂ terms on one side.',
      },
      nO2out: {
        expr: '100 × {nCO2} ÷ {y} − {nCO2} − {nN2}',
        how: 'The dry total, less the CO₂ and N₂.',
      },
      nN2: {
        expr: '100 × {nCO2} ÷ {y} − {nCO2} − {nO2out}',
        how: 'The dry total, less the CO₂ and O₂.',
      },
    },
  },
  example: methane,
  startWith: ['nF', 'ex'],
  representation: {
    kind: 'controlVolume',
    unit: 'burner',
    streams: [
      { name: 'Fuel', dir: 'in', amounts: [{ name: 'CH₄', n: 'nF' }] },
      {
        name: 'Air',
        dir: 'in',
        amounts: [
          { name: 'O₂', n: 'nO2' },
          { name: 'N₂', n: 'nN2' },
        ],
      },
      {
        name: 'Flue gas',
        dir: 'out',
        amounts: [
          { name: 'CO₂', n: 'nCO2' },
          { name: 'H₂O', n: 'nH2O' },
          { name: 'O₂', n: 'nO2out' },
          { name: 'N₂', n: 'nN2' },
        ],
        more: ['y'],
      },
    ],
    reaction: {
      equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
      nu: { 'CH₄': -1, 'O₂': -2, 'CO₂': 1, 'H₂O': 2 },
      extent: 'nF',
    },
    balanceUnit: 'mol/h',
  },
});

// ── HC5: a steam heater (material-energy-balances#3) ──

const heaterDemo = demo({
  id: 'g.he-controlVolume-heater',
  title: 'A heater: the duty and the steam it takes',
  use: 'Use this for “How much steam warms 2 kg/s of water from 20 °C to 80 °C?”',
  assumptions: [
    'Steady open system; kinetic and potential energy changes are negligible.',
    'Constant c_p; the bar measures h = c_pT from 0 °C.',
    'The steam condenses fully and leaves as saturated liquid, giving up λ per kilogram.',
  ],
  variables: [
    { id: 'm', symbol: 'ṁ', name: 'Water flow', unit: 'kg/s', min: 0.001, max: 1e5 },
    { id: 'cp', symbol: 'c_p', name: 'Specific heat', unit: 'kJ/(kg·K)', min: 0.1, max: 20 },
    { id: 'Tin', symbol: 'T_in', name: 'Inlet temperature', unit: '°C', min: -50, max: 500 },
    { id: 'Tout', symbol: 'T_out', name: 'Outlet temperature', unit: '°C', min: -50, max: 500 },
    { id: 'Q', symbol: 'Q̇', name: 'Heat duty', unit: 'kW', min: -1e8, max: 1e8 },
    { id: 'lam', symbol: 'λ', name: 'Latent heat of steam', unit: 'kJ/kg', min: 100, max: 3000 },
    { id: 'ms', symbol: 'ṁ_s', name: 'Steam flow', unit: 'kg/s', min: -1e5, max: 1e5 },
  ],
  relations: [
    {
      id: 'Q̇ = ṁc_p(T_out − T_in)',
      display: '{Q} = {m} × {cp} × ({Tout} − {Tin})',
      vars: ['Q', 'm', 'cp', 'Tout', 'Tin'],
      residual: (x) => x.Q! - x.m! * x.cp! * (x.Tout! - x.Tin!),
      solve: {
        Q: (x) => x.m! * x.cp! * (x.Tout! - x.Tin!),
        m: (x) => div(x.Q!, x.cp! * (x.Tout! - x.Tin!)),
        cp: (x) => div(x.Q!, x.m! * (x.Tout! - x.Tin!)),
        Tout: (x) => (x.m! * x.cp! === 0 ? undefined : x.Tin! + x.Q! / (x.m! * x.cp!)),
        Tin: (x) => (x.m! * x.cp! === 0 ? undefined : x.Tout! - x.Q! / (x.m! * x.cp!)),
      },
    },
    {
      id: 'ṁ_s = Q̇ ÷ λ',
      display: '{ms} = {Q} ÷ {lam}',
      vars: ['ms', 'Q', 'lam'],
      residual: (x) => x.ms! * x.lam! - x.Q!,
      solve: {
        ms: (x) => div(x.Q!, x.lam!),
        Q: (x) => x.ms! * x.lam!,
        lam: (x) => div(x.Q!, x.ms!),
      },
    },
  ],
  steps: {
    'Q̇ = ṁc_p(T_out − T_in)': {
      Q: {
        expr: '{m} × {cp} × ({Tout} − {Tin})',
        how: 'The energy balance on the water: the heat its warming takes.',
      },
      m: { expr: '{Q} ÷ ({cp} × ({Tout} − {Tin}))', how: 'Divide the duty by c_p and the rise.' },
      cp: {
        expr: '{Q} ÷ ({m} × ({Tout} − {Tin}))',
        how: 'Divide the duty by the flow and the rise.',
      },
      Tout: { expr: '{Tin} + {Q} ÷ ({m} × {cp})', how: 'Add the rise the duty gives.' },
      Tin: {
        expr: '{Tout} − {Q} ÷ ({m} × {cp})',
        how: 'Take the rise from the outlet temperature.',
      },
    },
    'ṁ_s = Q̇ ÷ λ': {
      ms: { expr: '{Q} ÷ {lam}', how: 'Each kilogram of steam that condenses gives λ.' },
      Q: { expr: '{ms} × {lam}', how: 'The steam’s flow times its latent heat.' },
      lam: { expr: '{Q} ÷ {ms}', how: 'The duty per kilogram of steam.' },
    },
  },
  example: { m: 2, cp: 4.18, Tin: 20, Tout: 80, Q: 501.6, lam: 2257, ms: 501.6 / 2257 },
  startWith: ['m', 'cp', 'Tin', 'Tout', 'lam'],
  representation: {
    kind: 'controlVolume',
    unit: 'heater',
    streams: [
      { name: 'Water in', dir: 'in', flow: 'm', T: 'Tin' },
      { name: 'Water out', dir: 'out', flow: 'm', T: 'Tout' },
    ],
    cp: 'cp',
    heat: 'Q',
    steam: { flow: 'ms', latent: 'lam' },
  },
});

// ── HC5: liquid extraction, one stage and a chain (separations#2) ──

const STAGE_STREAMS: Extract<Representation, { kind: 'controlVolume' }>['streams'] = [
  { name: 'Feed', dir: 'in' },
  { name: 'Solvent', dir: 'in' },
  { name: 'Raffinate', dir: 'out' },
  { name: 'Extract', dir: 'out' },
];

const oneStageDemo = demo({
  id: 'g.he-controlVolume-extraction',
  title: 'One extraction stage: the fraction left',
  use: 'Use this for “K_D = 4 and S/F = 0.5: what fraction of the solute stays in the feed after one stage?”',
  assumptions: [
    'The two solvents don’t mix; the solute is dilute; the stage reaches equilibrium.',
    'E = K_DS ÷ F compares the solute carried off by the solvent with what stays.',
  ],
  variables: [
    { id: 'kd', symbol: 'K_D', name: 'Distribution coefficient', min: 0.01, max: 1000 },
    { id: 'sf', symbol: 'S/F', name: 'Solvent-to-feed ratio', min: 0.01, max: 100 },
    { id: 'E', symbol: 'E', name: 'Extraction factor', min: 0, max: 1e5 },
    { id: 'left', symbol: 'f_left', name: 'Fraction left', min: 0, max: 1 },
    { id: 'ext', symbol: 'f_ext', name: 'Fraction extracted', min: 0, max: 1 },
  ],
  relations: [
    {
      id: 'E = K_DS ÷ F',
      display: '{E} = {kd} × {sf}',
      vars: ['E', 'kd', 'sf'],
      residual: (x) => x.E! - x.kd! * x.sf!,
      solve: { E: (x) => x.kd! * x.sf!, kd: (x) => div(x.E!, x.sf!), sf: (x) => div(x.E!, x.kd!) },
    },
    {
      id: 'f_left = 1 ÷ (1 + E)',
      display: '{left} = 1 ÷ (1 + {E})',
      vars: ['left', 'E'],
      residual: (x) => x.left! * (1 + x.E!) - 1,
      solve: {
        left: (x) => div(1, 1 + x.E!),
        E: (x) => (x.left === 0 ? undefined : 1 / x.left! - 1),
      },
    },
    {
      id: 'f_ext = 1 − f_left',
      display: '{ext} = 1 − {left}',
      vars: ['ext', 'left'],
      residual: (x) => x.ext! + x.left! - 1,
      solve: { ext: (x) => 1 - x.left!, left: (x) => 1 - x.ext! },
    },
  ],
  steps: {
    'E = K_DS ÷ F': {
      E: {
        expr: '{kd} × {sf}',
        how: 'The solvent carries K_D times the concentration, in S/F as much liquid.',
      },
      kd: { expr: '{E} ÷ {sf}', how: 'Divide E by the solvent ratio.' },
      sf: { expr: '{E} ÷ {kd}', how: 'Divide E by K_D.' },
    },
    'f_left = 1 ÷ (1 + E)': {
      left: {
        expr: '1 ÷ (1 + {E})',
        how: 'For each part left in the feed, E parts go to the solvent.',
      },
      E: { expr: '1 ÷ {left} − 1', how: 'Turn the fraction over, then take away 1.' },
    },
    'f_ext = 1 − f_left': {
      ext: { expr: '1 − {left}', how: 'What doesn’t stay is extracted.' },
      left: { expr: '1 − {ext}', how: 'What isn’t extracted stays.' },
    },
  },
  example: { kd: 4, sf: 0.5, E: 2, left: 1 / 3, ext: 2 / 3 },
  startWith: ['kd', 'sf'],
  representation: {
    kind: 'controlVolume',
    unit: 'stages',
    streams: STAGE_STREAMS,
    stages: { count: 1, flow: 'crosscurrent', kd: 'kd', ratio: 'sf', left: 'left', factor: 'E' },
  },
});

/** Crosscurrent stages: the solvent split equally, fresh into each. */
const crossModule = (id: string, title: string, use: string, n: number): ModuleDef => {
  const [kd, sf] = [4, 0.5];
  const E = (kd * sf) / n;
  return demo({
    id,
    title,
    use,
    assumptions: [
      'The total solvent is split into n equal parts, fresh solvent into each stage.',
      'The solvents don’t mix; each stage reaches equilibrium with the same K_D.',
    ],
    variables: [
      { id: 'kd', symbol: 'K_D', name: 'Distribution coefficient', min: 0.01, max: 1000 },
      { id: 'sf', symbol: 'S/F', name: 'Total solvent-to-feed ratio', min: 0.01, max: 100 },
      { id: 'n', symbol: 'n', name: 'Stages', min: 1, max: 10, integer: true },
      { id: 'E', symbol: 'E', name: 'Extraction factor per stage', min: 0, max: 1e5 },
      { id: 'left', symbol: 'f_left', name: 'Fraction left', min: 0, max: 1 },
    ],
    relations: [
      {
        id: 'E = K_D(S ÷ F) ÷ n',
        display: '{E} = {kd} × {sf} ÷ {n}',
        vars: ['E', 'kd', 'sf', 'n'],
        residual: (x) => x.E! * x.n! - x.kd! * x.sf!,
        solve: {
          E: (x) => div(x.kd! * x.sf!, x.n!),
          kd: (x) => div(x.E! * x.n!, x.sf!),
          sf: (x) => div(x.E! * x.n!, x.kd!),
          n: (x) => div(x.kd! * x.sf!, x.E!),
        },
      },
      {
        id: 'f_left = (1 ÷ (1 + E))ⁿ',
        display: '{left} = (1 ÷ (1 + {E}))^{n}',
        vars: ['left', 'E', 'n'],
        residual: (x) => x.left! - (1 / (1 + x.E!)) ** x.n!,
        solve: {
          left: (x) => (1 / (1 + x.E!)) ** x.n!,
          E: (x) => (x.left! > 0 ? x.left! ** (-1 / x.n!) - 1 : undefined),
        },
      },
    ],
    steps: {
      'E = K_D(S ÷ F) ÷ n': {
        E: { expr: '{kd} × {sf} ÷ {n}', how: 'Each stage gets 1/n of the solvent.' },
        kd: { expr: '{E} × {n} ÷ {sf}', how: 'Multiply by n, then divide by S/F.' },
        sf: { expr: '{E} × {n} ÷ {kd}', how: 'Multiply by n, then divide by K_D.' },
        n: { expr: '{kd} × {sf} ÷ {E}', how: 'How many shares of the solvent give this E.' },
      },
      'f_left = (1 ÷ (1 + E))ⁿ': {
        left: {
          expr: '(1 ÷ (1 + {E}))^{n}',
          how: 'Each stage keeps the same share; n stages multiply.',
        },
        E: {
          expr: '{left}^(−1 ÷ {n}) − 1',
          how: 'Take the n-th root, turn it over, then take away 1.',
        },
      },
    },
    example: { kd, sf, n, E, left: (1 / (1 + E)) ** n },
    startWith: ['kd', 'sf', 'n'],
    representation: {
      kind: 'controlVolume',
      unit: 'stages',
      streams: STAGE_STREAMS,
      stages: {
        count: 'n',
        flow: 'crosscurrent',
        kd: 'kd',
        ratio: 'sf',
        left: 'left',
        factor: 'E',
      },
    },
  });
};

const crossDemo = crossModule(
  'g.he-controlVolume-crosscurrent',
  'Crosscurrent extraction: the solvent in three parts',
  'Use this for “Is one wash with all the solvent better than three washes with a third each?”',
  3,
);

/** The edge of the range: eight small washes. */
const crossManyDemo = crossModule(
  'g.he-controlVolume-crosscurrent-many',
  'Crosscurrent extraction: eight small washes',
  'Use this for “How much solute is left after 8 washes, each with an eighth of the solvent?”',
  8,
);

const counterDemo = (() => {
  const [kd, sf, n] = [4, 0.5, 3];
  const E = kd * sf;
  return demo({
    id: 'g.he-controlVolume-countercurrent',
    title: 'Countercurrent extraction: the solvent against the feed',
    use: 'Use this for “Three countercurrent stages with E = 2: what fraction of the solute is left?”',
    assumptions: [
      'The feed and the solvent flow in opposite directions through n stages.',
      'The Kremser equation: constant K_D and flows, fresh solvent into the last stage.',
    ],
    variables: [
      { id: 'kd', symbol: 'K_D', name: 'Distribution coefficient', min: 0.01, max: 1000 },
      { id: 'sf', symbol: 'S/F', name: 'Solvent-to-feed ratio', min: 0.01, max: 100 },
      { id: 'n', symbol: 'n', name: 'Stages', min: 1, max: 10, integer: true },
      { id: 'E', symbol: 'E', name: 'Extraction factor', min: 0, max: 1e5 },
      { id: 'left', symbol: 'f_left', name: 'Fraction left', min: 0, max: 1 },
    ],
    relations: [
      {
        id: 'E = K_DS ÷ F',
        display: '{E} = {kd} × {sf}',
        vars: ['E', 'kd', 'sf'],
        residual: (x) => x.E! - x.kd! * x.sf!,
        solve: {
          E: (x) => x.kd! * x.sf!,
          kd: (x) => div(x.E!, x.sf!),
          sf: (x) => div(x.E!, x.kd!),
        },
      },
      {
        id: 'f_left = (E − 1) ÷ (Eⁿ⁺¹ − 1)',
        display: '{left} = ({E} − 1) ÷ ({E}^({n} + 1) − 1)',
        vars: ['left', 'E', 'n'],
        residual: (x) => x.left! * (x.E! ** (x.n! + 1) - 1) - (x.E! - 1),
        solve: {
          left: (x) => (x.E === 1 ? 1 / (x.n! + 1) : div(x.E! - 1, x.E! ** (x.n! + 1) - 1)),
          n: (x) =>
            x.E! > 0 && x.E !== 1 && x.left! > 0
              ? Math.log((x.E! - 1) / x.left! + 1) / Math.log(x.E!) - 1
              : undefined,
        },
      },
    ],
    steps: {
      'E = K_DS ÷ F': {
        E: { expr: '{kd} × {sf}', how: 'The whole solvent passes every stage.' },
        kd: { expr: '{E} ÷ {sf}', how: 'Divide E by the solvent ratio.' },
        sf: { expr: '{E} ÷ {kd}', how: 'Divide E by K_D.' },
      },
      'f_left = (E − 1) ÷ (Eⁿ⁺¹ − 1)': {
        left: {
          expr: '({E} − 1) ÷ ({E}^({n} + 1) − 1)',
          how: 'The Kremser equation for n stages.',
        },
        n: {
          expr: 'ln(({E} − 1) ÷ {left} + 1) ÷ ln({E}) − 1',
          how: 'Undo the fraction, then take logs to bring the power down.',
        },
      },
    },
    example: { kd, sf, n, E, left: (E - 1) / (E ** (n + 1) - 1) },
    startWith: ['kd', 'sf', 'n'],
    representation: {
      kind: 'controlVolume',
      unit: 'stages',
      streams: STAGE_STREAMS,
      stages: {
        count: 'n',
        flow: 'countercurrent',
        kd: 'kd',
        ratio: 'sf',
        left: 'left',
        factor: 'E',
      },
    },
  });
})();

// ── HC5: membranes (separations#3) ──

const seawater = (() => {
  const [c, M, i, T, R, dP, A] = [35, 58.44, 2, 25, 0.08314, 60, 1];
  const pi = i * (c / M) * R * (T + 273.15);
  return { c, M, i, T, R, pi, dP, A, J: A * (dP - pi) };
})();

const roDemo = demo({
  id: 'g.he-controlVolume-membrane',
  title: 'Reverse osmosis: the water flux',
  use: 'Use this for “Seawater at 35 g/L NaCl, 60 bar applied: what is the water flux?”',
  assumptions: [
    'The permeate is nearly salt-free; the van ’t Hoff form holds for the dilute salt.',
    'No concentration build-up at the membrane; water crosses only where ΔP passes π.',
    'R = 0.08314 L·bar/(mol·K); T is in °C and turned to kelvins.',
  ],
  variables: [
    { id: 'c', symbol: 'c', name: 'Salt concentration', unit: 'g/L', min: 0, max: 400 },
    { id: 'M', symbol: 'M', name: 'Molar mass of the salt', unit: 'g/mol', min: 1, max: 1000 },
    { id: 'i', symbol: 'i', name: 'Ions per formula unit', min: 1, max: 5, integer: true },
    { id: 'T', symbol: 'T', name: 'Temperature', unit: '°C', min: -20, max: 100 },
    { id: 'R', symbol: 'R', name: 'Gas constant', unit: 'L·bar/(mol·K)', min: 0.08, max: 0.09 },
    { id: 'pi', symbol: 'π', name: 'Osmotic pressure', unit: 'bar', min: 0, max: 1000 },
    { id: 'dP', symbol: 'ΔP', name: 'Applied pressure difference', unit: 'bar', min: 0, max: 1000 },
    {
      id: 'A',
      symbol: 'A_w',
      name: 'Water permeability',
      unit: 'L/(m²·h·bar)',
      min: 0.01,
      max: 100,
    },
    { id: 'J', symbol: 'J_w', name: 'Water flux', unit: 'L/(m²·h)', min: 0, max: 1e5 },
  ],
  relations: [
    {
      id: 'π = i(c ÷ M)R(T + 273.15)',
      display: '{pi} = {i} × ({c} ÷ {M}) × {R} × ({T} + 273.15)',
      vars: ['pi', 'i', 'c', 'M', 'R', 'T'],
      residual: (x) => x.pi! * x.M! - x.i! * x.c! * x.R! * (x.T! + 273.15),
      solve: {
        pi: (x) => div(x.i! * x.c! * x.R! * (x.T! + 273.15), x.M!),
        c: (x) => div(x.pi! * x.M!, x.i! * x.R! * (x.T! + 273.15)),
        M: (x) => div(x.i! * x.c! * x.R! * (x.T! + 273.15), x.pi!),
        i: (x) => div(x.pi! * x.M!, x.c! * x.R! * (x.T! + 273.15)),
        R: (x) => div(x.pi! * x.M!, x.i! * x.c! * (x.T! + 273.15)),
        T: (x) =>
          x.i! * x.c! * x.R! === 0 ? undefined : (x.pi! * x.M!) / (x.i! * x.c! * x.R!) - 273.15,
      },
    },
    {
      id: 'J_w = A_w(ΔP − π)',
      display: '{J} = {A} × ({dP} − {pi})',
      vars: ['J', 'A', 'dP', 'pi'],
      residual: (x) => x.J! - x.A! * (x.dP! - x.pi!),
      solve: {
        J: (x) => x.A! * (x.dP! - x.pi!),
        A: (x) => div(x.J!, x.dP! - x.pi!),
        dP: (x) => (x.A === 0 ? undefined : x.pi! + x.J! / x.A!),
        pi: (x) => (x.A === 0 ? undefined : x.dP! - x.J! / x.A!),
      },
    },
  ],
  steps: {
    'π = i(c ÷ M)R(T + 273.15)': {
      pi: {
        expr: '{i} × ({c} ÷ {M}) × {R} × ({T} + 273.15)',
        how: 'Van ’t Hoff: the ions’ molar concentration times RT, T in kelvins.',
      },
      c: {
        expr: '{pi} × {M} ÷ ({i} × {R} × ({T} + 273.15))',
        how: 'Divide π by iRT, then multiply by M.',
      },
      M: {
        expr: '{i} × {c} × {R} × ({T} + 273.15) ÷ {pi}',
        how: 'Multiply out, then divide by π.',
      },
      i: {
        expr: '{pi} × {M} ÷ ({c} × {R} × ({T} + 273.15))',
        how: 'Divide π by the salt’s cRT ÷ M.',
      },
      R: {
        expr: '{pi} × {M} ÷ ({i} × {c} × ({T} + 273.15))',
        how: 'Divide π by the ions’ concentration and T.',
      },
      T: {
        expr: '{pi} × {M} ÷ ({i} × {c} × {R}) − 273.15',
        how: 'Solve for the kelvins, then take away 273.15.',
      },
    },
    'J_w = A_w(ΔP − π)': {
      J: { expr: '{A} × ({dP} − {pi})', how: 'Water moves with the pressure left over after π.' },
      A: { expr: '{J} ÷ ({dP} − {pi})', how: 'Divide the flux by the driving pressure.' },
      dP: { expr: '{pi} + {J} ÷ {A}', how: 'The pressure that drives J_w, plus π to overcome.' },
      pi: { expr: '{dP} − {J} ÷ {A}', how: 'Take the driving pressure from ΔP.' },
    },
  },
  example: seawater,
  startWith: ['c', 'M', 'i', 'T', 'R', 'dP', 'A'],
  representation: {
    kind: 'controlVolume',
    unit: 'membrane',
    streams: [
      { name: 'Seawater', dir: 'in', more: ['c'] },
      { name: 'Brine', dir: 'out' },
      { name: 'Fresh water', dir: 'out', more: ['J'] },
    ],
    pressure: { applied: 'dP', osmotic: 'pi', permeability: 'A', flux: 'J' },
  },
});

const gasDemo = (() => {
  const [PA, PB, x] = [10, 2, 0.21];
  const a = PA / PB;
  return demo({
    id: 'g.he-controlVolume-gas-permeation',
    title: 'Gas permeation: oxygen-enriched air',
    use: 'Use this for “A membrane passes O₂ five times as fast as N₂. How rich in O₂ is the permeate from air?”',
    assumptions: [
      'The permeate side is at a far lower pressure than the feed (the low pressure-ratio limit).',
      'The feed’s composition barely changes along the membrane.',
    ],
    variables: [
      { id: 'PA', symbol: 'P_A', name: 'Permeability of O₂', unit: 'barrer', min: 0.001, max: 1e5 },
      { id: 'PB', symbol: 'P_B', name: 'Permeability of N₂', unit: 'barrer', min: 0.001, max: 1e5 },
      { id: 'a', symbol: 'α', name: 'Ideal selectivity', min: 0.001, max: 1e5 },
      { id: 'x', symbol: 'x_A', name: 'Feed O₂ fraction', min: 0, max: 0.99, step: 0.01 },
      { id: 'y', symbol: 'y_A', name: 'Permeate O₂ fraction', min: 0, max: 0.9999 },
    ],
    relations: [
      {
        id: 'α = P_A ÷ P_B',
        display: '{a} = {PA} ÷ {PB}',
        vars: ['a', 'PA', 'PB'],
        residual: (v) => v.a! * v.PB! - v.PA!,
        solve: {
          a: (v) => div(v.PA!, v.PB!),
          PA: (v) => v.a! * v.PB!,
          PB: (v) => div(v.PA!, v.a!),
        },
      },
      {
        id: 'y_A ÷ (1 − y_A) = αx_A ÷ (1 − x_A)',
        display: '{y} ÷ (1 − {y}) = {a} × {x} ÷ (1 − {x})',
        vars: ['y', 'a', 'x'],
        residual: (v) => v.y! * (1 - v.x!) - v.a! * v.x! * (1 - v.y!),
        solve: {
          y: (v) => div(v.a! * v.x!, 1 - v.x! + v.a! * v.x!),
          x: (v) => div(v.y!, v.a! - v.y! * (v.a! - 1)),
          a: (v) => div(v.y! * (1 - v.x!), v.x! * (1 - v.y!)),
        },
      },
    ],
    steps: {
      'α = P_A ÷ P_B': {
        a: { expr: '{PA} ÷ {PB}', how: 'How many times faster O₂ crosses than N₂.' },
        PA: { expr: '{a} × {PB}', how: 'Multiply N₂’s permeability by α.' },
        PB: { expr: '{PA} ÷ {a}', how: 'Divide O₂’s permeability by α.' },
      },
      'y_A ÷ (1 − y_A) = αx_A ÷ (1 − x_A)': {
        y: {
          expr: '{a} × {x} ÷ (1 − {x} + {a} × {x})',
          how: 'Each gas crosses in proportion to its share times its permeability.',
        },
        x: {
          expr: '{y} ÷ ({a} − {y} × ({a} − 1))',
          how: 'Clear the fractions and gather the x terms.',
        },
        a: {
          expr: '{y} × (1 − {x}) ÷ ({x} × (1 − {y}))',
          how: 'The permeate’s ratio over the feed’s.',
        },
      },
    },
    example: { PA, PB, a, x, y: (a * x) / (1 - x + a * x) },
    startWith: ['PA', 'PB', 'x'],
    representation: {
      kind: 'controlVolume',
      unit: 'membrane',
      streams: [
        { name: 'Air', dir: 'in', fractions: [{ name: 'O₂', x: 'x' }], rest: 'N₂' },
        { name: 'Retentate', dir: 'out' },
        { name: 'Permeate', dir: 'out', fractions: [{ name: 'O₂', x: 'y' }], rest: 'N₂' },
      ],
      selectivity: 'a',
    },
  });
})();

// ── HC5: a gas-turbine combustor (propulsion#3~burner) ──

const combustor = (() => {
  const [T3, T4, cp, QR, fst] = [600, 1400, 1.15, 43000, 0.068];
  const f = (cp * (T4 - T3)) / (QR - cp * T4);
  return { T3, T4, cp, QR, fst, f, phi: f / fst };
})();

const combustorDemo = demo({
  id: 'g.he-controlVolume-combustor',
  title: 'A combustor: the fuel–air ratio for an exit temperature',
  use: 'Use this for “Air enters the burner at 600 K. What fuel–air ratio heats it to 1400 K?”',
  assumptions: [
    'Per kilogram of air: f kg of fuel releases fQ_R, and 1 + f kg of gas leaves.',
    'One c_p for the air and the gas; total temperatures; no heat lost through the walls.',
    'φ compares f with the stoichiometric ratio f_st of the fuel.',
  ],
  variables: [
    { id: 'T3', symbol: 'T₀₃', name: 'Burner inlet temperature', unit: 'K', min: 200, max: 2000 },
    { id: 'T4', symbol: 'T₀₄', name: 'Burner exit temperature', unit: 'K', min: 200, max: 3000 },
    {
      id: 'cp',
      symbol: 'c_p',
      name: 'Specific heat of the gas',
      unit: 'kJ/(kg·K)',
      min: 0.5,
      max: 3,
    },
    {
      id: 'QR',
      symbol: 'Q_R',
      name: 'Heating value of the fuel',
      unit: 'kJ/kg',
      min: 1000,
      max: 150000,
    },
    { id: 'f', symbol: 'f', name: 'Fuel–air ratio', min: 0, max: 1 },
    { id: 'fst', symbol: 'f_st', name: 'Stoichiometric fuel–air ratio', min: 0.001, max: 1 },
    { id: 'phi', symbol: 'φ', name: 'Equivalence ratio', min: 0, max: 10 },
  ],
  relations: [
    {
      id: 'f = c_p(T₀₄ − T₀₃) ÷ (Q_R − c_pT₀₄)',
      display: '{f} = {cp} × ({T4} − {T3}) ÷ ({QR} − {cp} × {T4})',
      vars: ['f', 'cp', 'T4', 'T3', 'QR'],
      residual: (x) => x.f! * (x.QR! - x.cp! * x.T4!) - x.cp! * (x.T4! - x.T3!),
      solve: {
        f: (x) => div(x.cp! * (x.T4! - x.T3!), x.QR! - x.cp! * x.T4!),
        T3: (x) => (x.cp === 0 ? undefined : x.T4! - (x.f! * (x.QR! - x.cp! * x.T4!)) / x.cp!),
        T4: (x) => div(x.f! * x.QR! + x.cp! * x.T3!, x.cp! * (1 + x.f!)),
        QR: (x) => (x.f === 0 ? undefined : (x.cp! * (x.T4! - x.T3!)) / x.f! + x.cp! * x.T4!),
        cp: (x) => div(x.f! * x.QR!, x.T4! - x.T3! + x.f! * x.T4!),
      },
    },
    {
      id: 'φ = f ÷ f_st',
      display: '{phi} = {f} ÷ {fst}',
      vars: ['phi', 'f', 'fst'],
      residual: (x) => x.phi! * x.fst! - x.f!,
      solve: {
        phi: (x) => div(x.f!, x.fst!),
        f: (x) => x.phi! * x.fst!,
        fst: (x) => div(x.f!, x.phi!),
      },
    },
  ],
  steps: {
    'f = c_p(T₀₄ − T₀₃) ÷ (Q_R − c_pT₀₄)': {
      f: {
        expr: '{cp} × ({T4} − {T3}) ÷ ({QR} − {cp} × {T4})',
        how: 'Energy in, c_pT₀₃ + fQ_R, equals energy out, (1 + f)c_pT₀₄; solve for f.',
      },
      T3: {
        expr: '{T4} − {f} × ({QR} − {cp} × {T4}) ÷ {cp}',
        how: 'Undo the division, then solve for T₀₃.',
      },
      T4: {
        expr: '({f} × {QR} + {cp} × {T3}) ÷ ({cp} × (1 + {f}))',
        how: 'The energy in, shared over 1 + f kg of gas.',
      },
      QR: {
        expr: '{cp} × ({T4} − {T3}) ÷ {f} + {cp} × {T4}',
        how: 'Undo the division, then add c_pT₀₄.',
      },
      cp: {
        expr: '{f} × {QR} ÷ ({T4} − {T3} + {f} × {T4})',
        how: 'Gather the c_p terms on one side.',
      },
    },
    'φ = f ÷ f_st': {
      phi: {
        expr: '{f} ÷ {fst}',
        how: 'The fuel used, as a share of what would burn all the oxygen.',
      },
      f: { expr: '{phi} × {fst}', how: 'Multiply f_st by φ.' },
      fst: { expr: '{f} ÷ {phi}', how: 'Divide f by φ.' },
    },
  },
  example: combustor,
  startWith: ['T3', 'T4', 'cp', 'QR', 'fst'],
  representation: {
    kind: 'controlVolume',
    unit: 'burner',
    streams: [
      { name: 'Air', dir: 'in', flow: 1, symbol: 'ṁ_air', unit: 'kg', T: 'T3' },
      { name: 'Fuel', dir: 'in', flow: 'f', h: 'QR' },
      { name: 'Hot gas', dir: 'out', flow: [1, 'f'], symbol: 'ṁ_gas', unit: 'kg', T: 'T4' },
    ],
    cp: 'cp',
    energyUnit: 'kJ per kg of air',
    balanceUnit: 'kg per kg of air',
  },
});

// ── HC5: an aeration tank (environmental#1~activated-sludge) ──

const aerationDemo = demo({
  id: 'g.he-controlVolume-aeration',
  title: 'An aeration tank: F/M and the detention time',
  use: 'Use this for “10,000 m³/d at 200 mg/L BOD into a 3000 m³ tank at 2500 mg/L MLVSS: what are F/M and the HRT?”',
  assumptions: [
    'Steady flow; the tank is well mixed, so the biomass X is the same throughout.',
    'F/M uses the BOD fed each day and the biomass held in the tank.',
  ],
  variables: [
    { id: 'Q', symbol: 'Q', name: 'Wastewater flow', unit: 'm³/d', min: 1, max: 1e7 },
    { id: 'S0', symbol: 'S₀', name: 'Influent BOD', unit: 'mg/L', min: 1, max: 10000 },
    { id: 'V', symbol: 'V', name: 'Tank volume', unit: 'm³', min: 1, max: 1e7 },
    { id: 'X', symbol: 'X', name: 'Biomass (MLVSS)', unit: 'mg/L', min: 1, max: 20000 },
    {
      id: 'FM',
      symbol: 'F/M',
      name: 'Food-to-microorganism ratio',
      unit: 'per day',
      min: 0,
      max: 100,
    },
    { id: 'HRT', symbol: 'θ', name: 'Hydraulic retention time', unit: 'h', min: 0, max: 1e5 },
  ],
  relations: [
    {
      id: 'F/M = QS₀ ÷ (VX)',
      display: '{FM} = {Q} × {S0} ÷ ({V} × {X})',
      vars: ['FM', 'Q', 'S0', 'V', 'X'],
      residual: (x) => x.FM! * x.V! * x.X! - x.Q! * x.S0!,
      solve: {
        FM: (x) => div(x.Q! * x.S0!, x.V! * x.X!),
        Q: (x) => div(x.FM! * x.V! * x.X!, x.S0!),
        S0: (x) => div(x.FM! * x.V! * x.X!, x.Q!),
        V: (x) => div(x.Q! * x.S0!, x.FM! * x.X!),
        X: (x) => div(x.Q! * x.S0!, x.FM! * x.V!),
      },
    },
    {
      id: 'θ = 24V ÷ Q',
      display: '{HRT} = 24 × {V} ÷ {Q}',
      vars: ['HRT', 'V', 'Q'],
      residual: (x) => x.HRT! * x.Q! - 24 * x.V!,
      solve: {
        HRT: (x) => div(24 * x.V!, x.Q!),
        V: (x) => (x.HRT! * x.Q!) / 24,
        Q: (x) => div(24 * x.V!, x.HRT!),
      },
    },
  ],
  steps: {
    'F/M = QS₀ ÷ (VX)': {
      FM: {
        expr: '{Q} × {S0} ÷ ({V} × {X})',
        how: 'The BOD fed each day over the biomass in the tank.',
      },
      Q: { expr: '{FM} × {V} × {X} ÷ {S0}', how: 'Multiply out, then divide by S₀.' },
      S0: { expr: '{FM} × {V} × {X} ÷ {Q}', how: 'Multiply out, then divide by Q.' },
      V: { expr: '{Q} × {S0} ÷ ({FM} × {X})', how: 'Divide the food by F/M and X.' },
      X: { expr: '{Q} × {S0} ÷ ({FM} × {V})', how: 'Divide the food by F/M and V.' },
    },
    'θ = 24V ÷ Q': {
      HRT: { expr: '24 × {V} ÷ {Q}', how: 'V ÷ Q is in days; 24 turns it into hours.' },
      V: { expr: '{HRT} × {Q} ÷ 24', how: 'The volume that flows in during θ.' },
      Q: { expr: '24 × {V} ÷ {HRT}', how: 'Divide the volume by the time, in days.' },
    },
  },
  example: { Q: 10000, S0: 200, V: 3000, X: 2500, FM: 0.2666666666666667, HRT: 7.2 },
  startWith: ['Q', 'S0', 'V', 'X'],
  representation: {
    kind: 'controlVolume',
    unit: 'tank',
    streams: [
      { name: 'Wastewater', dir: 'in', flow: 'Q', more: ['S0'] },
      { name: 'To clarifier', dir: 'out', flow: 'Q' },
    ],
    volume: 'V',
    residence: { tau: 'HRT', factor: 24 },
    loading: { biomass: 'X', ratio: 'FM', substrate: 'S0' },
  },
});

// ── HC5: a mixing tank's time constant (process-control#0~tank) ──

const tankDemo = demo({
  id: 'g.he-controlVolume-tank',
  title: 'A mixing tank’s time constant',
  use: 'Use this for “A 2 m³ tank takes 0.1 m³/min. What is its time constant?”',
  assumptions: [
    'Constant volume: the flow out equals the flow in.',
    'Well mixed, so the outlet has the tank’s composition; τ = V ÷ q is its time constant.',
  ],
  variables: [
    { id: 'V', symbol: 'V', name: 'Tank volume', unit: 'm³', min: 0.001, max: 1e6 },
    { id: 'q', symbol: 'q', name: 'Volumetric flow', unit: 'm³/min', min: 0.0001, max: 1e5 },
    { id: 'tau', symbol: 'τ', name: 'Time constant', unit: 'min', min: 0, max: 1e7 },
  ],
  relations: [
    {
      id: 'τ = V ÷ q',
      display: '{tau} = {V} ÷ {q}',
      vars: ['tau', 'V', 'q'],
      residual: (x) => x.tau! * x.q! - x.V!,
      solve: { tau: (x) => div(x.V!, x.q!), V: (x) => x.tau! * x.q!, q: (x) => div(x.V!, x.tau!) },
    },
  ],
  steps: {
    'τ = V ÷ q': {
      tau: { expr: '{V} ÷ {q}', how: 'The time the flow takes to fill the tank once.' },
      V: { expr: '{tau} × {q}', how: 'The volume that flows in during τ.' },
      q: { expr: '{V} ÷ {tau}', how: 'The volume over the time constant.' },
    },
  },
  example: { V: 2, q: 0.1, tau: 20 },
  startWith: ['V', 'q'],
  representation: {
    kind: 'controlVolume',
    unit: 'tank',
    streams: [
      { name: 'In', dir: 'in', flow: 'q' },
      { name: 'Out', dir: 'out', flow: 'q' },
    ],
    volume: 'V',
    residence: { tau: 'tau' },
  },
});

// ── HC5: steady-flow devices (thermodynamics#1~steady-flow, ~nozzle, ~mixing) ──

/** Ẇ = ṁ(h₁ − h₂) + Q̇ through a turbine or a compressor. */
const workDevice = (
  id: string,
  title: string,
  use: string,
  device: 'turbine' | 'compressor',
  ex: { m: number; h1: number; h2: number; Q: number },
  fluid: string,
): ModuleDef =>
  demo({
    id,
    title,
    use,
    assumptions: [
      'Steady flow, one inlet and one outlet; kinetic and potential energy changes neglected.',
      'Q̇ is the heat into the device (negative when lost); Ẇ is the work out (negative when put in).',
    ],
    variables: [
      { id: 'm', symbol: 'ṁ', name: 'Mass flow', unit: 'kg/s', min: 0.001, max: 1e5 },
      { id: 'h1', symbol: 'h₁', name: 'Inlet enthalpy', unit: 'kJ/kg', min: -1000, max: 5000 },
      { id: 'h2', symbol: 'h₂', name: 'Outlet enthalpy', unit: 'kJ/kg', min: -1000, max: 5000 },
      { id: 'Q', symbol: 'Q̇', name: 'Heat in', unit: 'kW', min: -1e7, max: 1e7 },
      { id: 'W', symbol: 'Ẇ', name: 'Power out', unit: 'kW', min: -1e8, max: 1e8 },
    ],
    relations: [
      {
        id: 'Ẇ = ṁ(h₁ − h₂) + Q̇',
        display: '{W} = {m} × ({h1} − {h2}) + {Q}',
        vars: ['W', 'm', 'h1', 'h2', 'Q'],
        residual: (x) => x.W! - x.m! * (x.h1! - x.h2!) - x.Q!,
        solve: {
          W: (x) => x.m! * (x.h1! - x.h2!) + x.Q!,
          m: (x) => div(x.W! - x.Q!, x.h1! - x.h2!),
          h1: (x) => (x.m === 0 ? undefined : x.h2! + (x.W! - x.Q!) / x.m!),
          h2: (x) => (x.m === 0 ? undefined : x.h1! - (x.W! - x.Q!) / x.m!),
          Q: (x) => x.W! - x.m! * (x.h1! - x.h2!),
        },
      },
    ],
    steps: {
      'Ẇ = ṁ(h₁ − h₂) + Q̇': {
        W: {
          expr: '{m} × ({h1} − {h2}) + {Q}',
          how: 'The steady-flow energy balance: the enthalpy the flow gives up, plus the heat in.',
        },
        m: {
          expr: '({W} − {Q}) ÷ ({h1} − {h2})',
          how: 'Take Q̇ from Ẇ, then divide by the enthalpy drop.',
        },
        h1: { expr: '{h2} + ({W} − {Q}) ÷ {m}', how: 'Add the drop per kilogram to h₂.' },
        h2: { expr: '{h1} − ({W} − {Q}) ÷ {m}', how: 'Take the drop per kilogram from h₁.' },
        Q: { expr: '{W} − {m} × ({h1} − {h2})', how: 'Take the flow’s share from the power.' },
      },
    },
    example: { ...ex, W: ex.m * (ex.h1 - ex.h2) + ex.Q },
    startWith: ['m', 'h1', 'h2', 'Q'],
    representation: {
      kind: 'controlVolume',
      device,
      streams: [
        { name: `${fluid} in`, dir: 'in', flow: 'm', h: 'h1' },
        { name: `${fluid} out`, dir: 'out', flow: 'm', h: 'h2' },
      ],
      heat: 'Q',
      work: 'W',
    },
  });

const turbineDemo = workDevice(
  'g.he-controlVolume-turbine',
  'A steam turbine’s power',
  'Use this for “2 kg/s of steam drops from 3230 to 2600 kJ/kg and loses 20 kW. What power?”',
  'turbine',
  { m: 2, h1: 3230, h2: 2600, Q: -20 },
  'Steam',
);

const compressorDemo = workDevice(
  'g.he-controlVolume-compressor',
  'An air compressor: work put in',
  'Use this for “0.5 kg/s of air goes from 300 to 500 kJ/kg, losing 5 kW. What power does it take?”',
  'compressor',
  { m: 0.5, h1: 300, h2: 500, Q: -5 },
  'Air',
);

/** V₂ = √(V₁² + 2(h₁ − h₂)) through a nozzle or a diffuser (h in kJ/kg, so × 1000). */
const speedDevice = (
  id: string,
  title: string,
  use: string,
  device: 'nozzle' | 'diffuser',
  ex: { V1: number; h1: number; h2: number },
): ModuleDef =>
  demo({
    id,
    title,
    use,
    assumptions: [
      'Steady, adiabatic, no work; the potential energy change is neglected.',
      'h is in kJ/kg: × 1000 turns it into J/kg, so V comes out in m/s.',
    ],
    variables: [
      { id: 'V1', symbol: 'V₁', name: 'Inlet speed', unit: 'm/s', min: 0, max: 3000 },
      { id: 'h1', symbol: 'h₁', name: 'Inlet enthalpy', unit: 'kJ/kg', min: -1000, max: 5000 },
      { id: 'h2', symbol: 'h₂', name: 'Outlet enthalpy', unit: 'kJ/kg', min: -1000, max: 5000 },
      { id: 'V2', symbol: 'V₂', name: 'Outlet speed', unit: 'm/s', min: 0, max: 3000 },
    ],
    relations: [
      {
        id: 'V₂ = √(V₁² + 2000(h₁ − h₂))',
        display: '{V2} = √({V1}² + 2000 × ({h1} − {h2}))',
        vars: ['V2', 'V1', 'h1', 'h2'],
        residual: (x) => x.V2! ** 2 - x.V1! ** 2 - 2000 * (x.h1! - x.h2!),
        solve: {
          V2: (x) => {
            const s = x.V1! ** 2 + 2000 * (x.h1! - x.h2!);
            return s < 0 ? NaN : Math.sqrt(s);
          },
          V1: (x) => {
            const s = x.V2! ** 2 - 2000 * (x.h1! - x.h2!);
            return s < 0 ? NaN : Math.sqrt(s);
          },
          h1: (x) => x.h2! + (x.V2! ** 2 - x.V1! ** 2) / 2000,
          h2: (x) => x.h1! - (x.V2! ** 2 - x.V1! ** 2) / 2000,
        },
      },
    ],
    steps: {
      'V₂ = √(V₁² + 2000(h₁ − h₂))': {
        V2: {
          expr: '√({V1}² + 2000 × ({h1} − {h2}))',
          how: 'The enthalpy given up becomes kinetic energy V² ÷ 2, h in J/kg.',
        },
        V1: {
          expr: '√({V2}² − 2000 × ({h1} − {h2}))',
          how: 'Take the enthalpy’s share from V₂², then the root.',
        },
        h1: {
          expr: '{h2} + ({V2}² − {V1}²) ÷ 2000',
          how: 'The gain in V² ÷ 2, in kJ/kg, added to h₂.',
        },
        h2: {
          expr: '{h1} − ({V2}² − {V1}²) ÷ 2000',
          how: 'The gain in V² ÷ 2, in kJ/kg, taken from h₁.',
        },
      },
    },
    example: { ...ex, V2: Math.sqrt(ex.V1 ** 2 + 2000 * (ex.h1 - ex.h2)) },
    startWith: ['V1', 'h1', 'h2'],
    representation: {
      kind: 'controlVolume',
      device,
      streams: [
        { name: 'Inlet', dir: 'in', h: 'h1', V: 'V1' },
        { name: 'Exit', dir: 'out', h: 'h2', V: 'V2' },
      ],
      energyUnit: 'kJ/kg',
    },
  });

const nozzleDemo = speedDevice(
  'g.he-controlVolume-nozzle',
  'A nozzle’s exit speed',
  'Use this for “Steam enters a nozzle at 30 m/s and its enthalpy drops 50 kJ/kg. How fast does it leave?”',
  'nozzle',
  { V1: 30, h1: 2950, h2: 2900 },
);

const diffuserDemo = speedDevice(
  'g.he-controlVolume-diffuser',
  'A diffuser slows the flow',
  'Use this for “Air enters a diffuser at 250 m/s and its enthalpy rises 30 kJ/kg. How fast does it leave?”',
  'diffuser',
  { V1: 250, h1: 300, h2: 330 },
);

const valveDemo = (() => {
  const [h1, hf, hfg] = [100, 25, 215];
  return demo({
    id: 'g.he-controlVolume-valve',
    title: 'A throttling valve: the quality after it',
    use: 'Use this for “Liquid at 100 kJ/kg is throttled to a pressure where h_f = 25 and h_fg = 215 kJ/kg. What is the quality?”',
    assumptions: [
      'Throttling is adiabatic with no work and small speed changes, so h₂ = h₁.',
      'Downstream the fluid is a liquid–vapour mixture; h_f and h_fg are read at the outlet pressure.',
    ],
    variables: [
      { id: 'h1', symbol: 'h₁', name: 'Inlet enthalpy', unit: 'kJ/kg', min: -1000, max: 5000 },
      { id: 'h2', symbol: 'h₂', name: 'Outlet enthalpy', unit: 'kJ/kg', min: -1000, max: 5000 },
      {
        id: 'hf',
        symbol: 'h_f',
        name: 'Saturated liquid enthalpy',
        unit: 'kJ/kg',
        min: -1000,
        max: 5000,
      },
      {
        id: 'hfg',
        symbol: 'h_fg',
        name: 'Enthalpy of vaporization',
        unit: 'kJ/kg',
        min: 1,
        max: 5000,
      },
      { id: 'x', symbol: 'x₂', name: 'Outlet quality', min: 0, max: 1 },
    ],
    relations: [
      {
        id: 'h₂ = h₁',
        display: '{h2} = {h1}',
        vars: ['h2', 'h1'],
        residual: (v) => v.h2! - v.h1!,
        solve: { h2: (v) => v.h1!, h1: (v) => v.h2! },
      },
      {
        id: 'x₂ = (h₂ − h_f) ÷ h_fg',
        display: '{x} = ({h2} − {hf}) ÷ {hfg}',
        vars: ['x', 'h2', 'hf', 'hfg'],
        residual: (v) => v.x! * v.hfg! - (v.h2! - v.hf!),
        solve: {
          x: (v) => div(v.h2! - v.hf!, v.hfg!),
          h2: (v) => v.hf! + v.x! * v.hfg!,
          hf: (v) => v.h2! - v.x! * v.hfg!,
          hfg: (v) => div(v.h2! - v.hf!, v.x!),
        },
      },
    ],
    steps: {
      'h₂ = h₁': {
        h2: { expr: '{h1}', how: 'No heat, no work: the enthalpy passes the valve unchanged.' },
        h1: { expr: '{h2}', how: 'The enthalpy is the same on both sides.' },
      },
      'x₂ = (h₂ − h_f) ÷ h_fg': {
        x: {
          expr: '({h2} − {hf}) ÷ {hfg}',
          how: 'How far h₂ is from saturated liquid toward vapour.',
        },
        h2: { expr: '{hf} + {x} × {hfg}', how: 'Liquid’s enthalpy, plus x of the vaporization.' },
        hf: { expr: '{h2} − {x} × {hfg}', how: 'Take the vapour’s share from h₂.' },
        hfg: { expr: '({h2} − {hf}) ÷ {x}', how: 'Divide the rise above h_f by x.' },
      },
    },
    example: { h1, h2: h1, hf, hfg, x: (h1 - hf) / hfg },
    startWith: ['h1', 'hf', 'hfg'],
    representation: {
      kind: 'controlVolume',
      device: 'valve',
      streams: [
        { name: 'Liquid in', dir: 'in', h: 'h1' },
        { name: 'Mixture out', dir: 'out', h: 'h2', more: ['x'] },
      ],
      energyUnit: 'kJ/kg',
    },
  });
})();

const pumpDemo = (() => {
  const [m, v, P1, P2] = [5, 0.001, 100, 3100];
  return demo({
    id: 'g.he-controlVolume-pump',
    title: 'A pump: the power it takes',
    use: 'Use this for “A pump raises 5 kg/s of water from 100 to 3100 kPa. What power does it take?”',
    assumptions: [
      'Liquid water is incompressible, so the work per kilogram is vΔP.',
      'Adiabatic and reversible; speeds and heights the same in and out.',
    ],
    variables: [
      { id: 'm', symbol: 'ṁ', name: 'Mass flow', unit: 'kg/s', min: 0.001, max: 1e5 },
      { id: 'v', symbol: 'v', name: 'Specific volume', unit: 'm³/kg', min: 0.0001, max: 1 },
      { id: 'P1', symbol: 'P₁', name: 'Inlet pressure', unit: 'kPa', min: 0, max: 1e5 },
      { id: 'P2', symbol: 'P₂', name: 'Outlet pressure', unit: 'kPa', min: 0, max: 1e5 },
      { id: 'W', symbol: 'Ẇ_in', name: 'Power in', unit: 'kW', min: -1e7, max: 1e7 },
    ],
    relations: [
      {
        id: 'Ẇ_in = ṁv(P₂ − P₁)',
        display: '{W} = {m} × {v} × ({P2} − {P1})',
        vars: ['W', 'm', 'v', 'P2', 'P1'],
        residual: (x) => x.W! - x.m! * x.v! * (x.P2! - x.P1!),
        solve: {
          W: (x) => x.m! * x.v! * (x.P2! - x.P1!),
          m: (x) => div(x.W!, x.v! * (x.P2! - x.P1!)),
          v: (x) => div(x.W!, x.m! * (x.P2! - x.P1!)),
          P2: (x) => (x.m! * x.v! === 0 ? undefined : x.P1! + x.W! / (x.m! * x.v!)),
          P1: (x) => (x.m! * x.v! === 0 ? undefined : x.P2! - x.W! / (x.m! * x.v!)),
        },
      },
    ],
    steps: {
      'Ẇ_in = ṁv(P₂ − P₁)': {
        W: { expr: '{m} × {v} × ({P2} − {P1})', how: 'Each kilogram takes vΔP; kPa × m³ is kJ.' },
        m: {
          expr: '{W} ÷ ({v} × ({P2} − {P1}))',
          how: 'Divide the power by the work per kilogram.',
        },
        v: { expr: '{W} ÷ ({m} × ({P2} − {P1}))', how: 'Divide the power by ṁ and the rise.' },
        P2: { expr: '{P1} + {W} ÷ ({m} × {v})', how: 'Add the pressure rise the power gives.' },
        P1: { expr: '{P2} − {W} ÷ ({m} × {v})', how: 'Take the rise from the outlet pressure.' },
      },
    },
    example: { m, v, P1, P2, W: m * v * (P2 - P1) },
    startWith: ['m', 'v', 'P1', 'P2'],
    representation: {
      kind: 'controlVolume',
      device: 'pump',
      streams: [
        { name: 'Water in', dir: 'in', flow: 'm', P: 'P1' },
        { name: 'Water out', dir: 'out', flow: 'm', P: 'P2' },
      ],
      work: 'W',
      workIn: true,
    },
  });
})();

const mixingDemo = (() => {
  const [m1, h1, m2, h2] = [2, 335, 3, 84];
  const m3 = m1 + m2;
  return demo({
    id: 'g.he-controlVolume-mixing',
    title: 'A mixing chamber: the outlet enthalpy',
    use: 'Use this for “2 kg/s at 335 kJ/kg mixes with 3 kg/s at 84 kJ/kg. What is the outlet enthalpy?”',
    assumptions: [
      'Steady, adiabatic, no work; kinetic and potential energy changes neglected.',
      'Mass in equals mass out, and so does ṁh.',
    ],
    variables: [
      { id: 'm1', symbol: 'ṁ₁', name: 'Hot stream flow', unit: 'kg/s', min: 0, max: 1e5 },
      { id: 'h1', symbol: 'h₁', name: 'Hot stream enthalpy', unit: 'kJ/kg', min: -1000, max: 5000 },
      { id: 'm2', symbol: 'ṁ₂', name: 'Cold stream flow', unit: 'kg/s', min: 0, max: 1e5 },
      {
        id: 'h2',
        symbol: 'h₂',
        name: 'Cold stream enthalpy',
        unit: 'kJ/kg',
        min: -1000,
        max: 5000,
      },
      { id: 'm3', symbol: 'ṁ₃', name: 'Outlet flow', unit: 'kg/s', min: 0, max: 2e5 },
      { id: 'h3', symbol: 'h₃', name: 'Outlet enthalpy', unit: 'kJ/kg', min: -1000, max: 5000 },
    ],
    relations: [
      {
        id: 'ṁ₃ = ṁ₁ + ṁ₂',
        display: '{m3} = {m1} + {m2}',
        vars: ['m3', 'm1', 'm2'],
        residual: (x) => x.m3! - x.m1! - x.m2!,
        solve: { m3: (x) => x.m1! + x.m2!, m1: (x) => x.m3! - x.m2!, m2: (x) => x.m3! - x.m1! },
      },
      {
        id: 'ṁ₃h₃ = ṁ₁h₁ + ṁ₂h₂',
        display: '{m3} × {h3} = {m1} × {h1} + {m2} × {h2}',
        vars: ['h3', 'm3', 'm1', 'h1', 'm2', 'h2'],
        residual: (x) => x.m3! * x.h3! - x.m1! * x.h1! - x.m2! * x.h2!,
        solve: {
          h3: (x) => div(x.m1! * x.h1! + x.m2! * x.h2!, x.m3!),
          h1: (x) => div(x.m3! * x.h3! - x.m2! * x.h2!, x.m1!),
          h2: (x) => div(x.m3! * x.h3! - x.m1! * x.h1!, x.m2!),
          m1: (x) => div(x.m3! * x.h3! - x.m2! * x.h2!, x.h1!),
          m2: (x) => div(x.m3! * x.h3! - x.m1! * x.h1!, x.h2!),
          m3: (x) => div(x.m1! * x.h1! + x.m2! * x.h2!, x.h3!),
        },
      },
    ],
    steps: {
      'ṁ₃ = ṁ₁ + ṁ₂': {
        m3: { expr: '{m1} + {m2}', how: 'Mass in equals mass out.' },
        m1: { expr: '{m3} − {m2}', how: 'Take the cold stream from the outlet.' },
        m2: { expr: '{m3} − {m1}', how: 'Take the hot stream from the outlet.' },
      },
      'ṁ₃h₃ = ṁ₁h₁ + ṁ₂h₂': {
        h3: {
          expr: '({m1} × {h1} + {m2} × {h2}) ÷ {m3}',
          how: 'The energy in, shared over the outlet flow: a weighted mean.',
        },
        h1: {
          expr: '({m3} × {h3} − {m2} × {h2}) ÷ {m1}',
          how: 'The energy out less the cold stream’s, over ṁ₁.',
        },
        h2: {
          expr: '({m3} × {h3} − {m1} × {h1}) ÷ {m2}',
          how: 'The energy out less the hot stream’s, over ṁ₂.',
        },
        m1: { expr: '({m3} × {h3} − {m2} × {h2}) ÷ {h1}', how: 'The hot stream’s energy over h₁.' },
        m2: {
          expr: '({m3} × {h3} − {m1} × {h1}) ÷ {h2}',
          how: 'The cold stream’s energy over h₂.',
        },
        m3: { expr: '({m1} × {h1} + {m2} × {h2}) ÷ {h3}', how: 'The energy in over h₃.' },
      },
    },
    example: { m1, h1, m2, h2, m3, h3: (m1 * h1 + m2 * h2) / m3 },
    startWith: ['m1', 'h1', 'm2', 'h2'],
    representation: {
      kind: 'controlVolume',
      device: 'mixingChamber',
      streams: [
        { name: 'Hot water', dir: 'in', flow: 'm1', h: 'h1' },
        { name: 'Cold water', dir: 'in', flow: 'm2', h: 'h2' },
        { name: 'Mixed', dir: 'out', flow: 'm3', h: 'h3' },
      ],
      energyUnit: 'kW',
    },
  });
})();

export const HC5_DEMOS: ModuleDef[] = [
  streamDemo,
  dofDemo,
  mixerDemo,
  columnDemo,
  bypassDemo,
  combustionDemo,
  heaterDemo,
  oneStageDemo,
  crossDemo,
  crossManyDemo,
  counterDemo,
  roDemo,
  gasDemo,
  combustorDemo,
  aerationDemo,
  tankDemo,
  turbineDemo,
  compressorDemo,
  pumpDemo,
  nozzleDemo,
  diffuserDemo,
  valveDemo,
  mixingDemo,
];

export const HE1F_GALLERY_MODULES: ModuleDef[] = [...HC5_DEMOS];

export const HE1F_GALLERY_LAYOUTS: LayoutDef[] = [];
