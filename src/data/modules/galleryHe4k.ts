/**
 * College gallery demos, round 4, group K (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 * HC160: `dialyzer` (he.engineering.biotransport#2).
 * HC161: `attenuation` (he.engineering.bioinstrumentation#2, ~ultrasound).
 * HC162: `scaffold` (he.engineering.tissue-engineering#0).
 * HC163: `ligandGrid` (he.engineering.tissue-engineering#1).
 * HC164: `bioreactor` (he.engineering.tissue-engineering#2).
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation, StepText } from './types';

type Solver = (v: Values) => number | number[] | undefined;
type Rule = { relation: Relation; steps: Record<string, StepText> };

/** A value with its unit (one unit: the formula is written in it). */
const num = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  ...more,
});

/** A value worked out, never typed. */
const out = (
  id: string,
  symbol: string,
  name: string,
  unit?: string,
  more: Partial<VariableDef> = {},
) => num(id, symbol, name, unit, -1e12, 1e12, { derived: true, ...more });

/** A finite number, or nothing. */
const fin = (x: number) => (Number.isFinite(x) ? x : undefined);
/** A finite positive number, or nothing. */
const posOf = (x: number) => (Number.isFinite(x) && x > 0 ? x : undefined);

/** A relation with its steps: each variable's solver, expression and explanation. */
function rule(
  id: string,
  display: string,
  vars: string[],
  residual: (v: Values) => number,
  parts: Record<string, [Solver, StepText['expr'], StepText['how']]>,
): Rule {
  const solve: Record<string, Solver> = {};
  const steps: Record<string, StepText> = {};
  for (const [v, [fn, expr, how]] of Object.entries(parts)) {
    solve[v] = fn;
    steps[v] = { expr, how };
  }
  for (const v of vars) if (!(v in solve)) solve[v] = () => undefined;
  return { relation: { id, display, vars, residual, solve }, steps };
}

/** A demo from its rules. */
function page(
  d: Omit<ModuleDef, 'relations' | 'steps' | 'representation' | 'startWith'> & {
    rules: Rule[];
    representation: Representation;
    startWith?: string[];
  },
): ModuleDef {
  const { rules, ...rest } = d;
  return {
    ...rest,
    // College pages are metric; every typed value opens filled (the example is whole).
    unitSystems: ['metric'],
    startWith: d.startWith ?? d.variables.filter((v) => !v.derived).map((v) => v.id),
    relations: rules.map((r) => r.relation),
    steps: Object.fromEntries(rules.map((r) => [r.relation.id, r.steps])),
  };
}

/** Values worked out from the typed ones of an example, in order. */
function example(typed: Values, ...work: [string, (v: Values) => number][]): Values {
  const v: Values = { ...typed };
  for (const [id, f] of work) v[id] = f(v);
  return v;
}

// ─── HC160: a dialyzer's clearance (biotransport#2) ────────────────────────────

const kOf = (v: Values) => (v.qb! * (v.cin! - v.cout!)) / v.cin!;
const ktvOf = (v: Values) => (v.k! * v.t!) / (1000 * v.v!);
const urrOf = (v: Values) => 100 * (1 - Math.exp(-v.ktv!));

const clearanceRule = rule(
  'clearance',
  '{k} = {qb} × ({cin} − {cout}) ÷ {cin}',
  ['k', 'qb', 'cin', 'cout'],
  (v) => v.k! * v.cin! - v.qb! * (v.cin! - v.cout!),
  {
    k: [
      (v) => fin(kOf(v)),
      '{qb} × ({cin} − {cout}) ÷ {cin}',
      'The blood loses (C_in − C_out) ÷ C_in of its urea: that share of Q_b is cleared completely.',
    ],
    qb: [
      (v) => posOf((v.k! * v.cin!) / (v.cin! - v.cout!)),
      '{k} × {cin} ÷ ({cin} − {cout})',
      'Divide the clearance by the share of urea the blood loses.',
    ],
    cout: [
      (v) => fin(v.cin! * (1 - v.k! / v.qb!)),
      '{cin} × (1 − {k} ÷ {qb})',
      'The share K ÷ Q_b of the urea is taken out; the rest leaves with the blood.',
    ],
    cin: [
      (v) => posOf((v.qb! * v.cout!) / (v.qb! - v.k!)),
      '{qb} × {cout} ÷ ({qb} − {k})',
      'The outlet keeps (Q_b − K) ÷ Q_b of the inlet’s urea.',
    ],
  },
);

const ktvRule = rule(
  'ktv',
  '{ktv} = {k} × {t} ÷ (1000 × {v})',
  ['ktv', 'k', 't', 'v'],
  (v) => 1000 * v.ktv! * v.v! - v.k! * v.t!,
  {
    ktv: [
      (v) => fin(ktvOf(v)),
      '{k} × {t} ÷ (1000 × {v})',
      'The blood volume cleared in the session, K × t in mL, over the body water V (1 L is 1000 mL).',
    ],
    t: [
      (v) => posOf((1000 * v.ktv! * v.v!) / v.k!),
      '1000 × {ktv} × {v} ÷ {k}',
      'The session clears Kt/V of the body water: divide that volume by K.',
    ],
    v: [
      (v) => posOf((v.k! * v.t!) / (1000 * v.ktv!)),
      '{k} × {t} ÷ (1000 × {ktv})',
      'The volume cleared, K × t, is Kt/V times the body water.',
    ],
  },
);

const urrRule = rule(
  'urr',
  '{urr} = 100 × (1 − 1 ÷ e^({ktv}))',
  ['urr', 'ktv'],
  (v) => v.urr! - urrOf(v),
  {
    urr: [
      (v) => fin(urrOf(v)),
      '100 × (1 − 1 ÷ e^({ktv}))',
      'In one well-mixed pool the urea falls by e^(−Kt/V); the rest is the share removed.',
    ],
    ktv: [
      (v) => fin(-Math.log(1 - v.urr! / 100)),
      '−ln(1 − {urr} ÷ 100)',
      'The share left is e^(−Kt/V): take its natural log.',
    ],
  },
);

const dialyzerPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'The body’s urea is one well-mixed pool of water V.',
      'Urea made during the session is ignored.',
      'K counts the blood cleared completely: Q_b times the share of urea taken out.',
    ],
    variables: [
      num('qb', 'Q_b', 'Blood flow', 'mL/min', 50, 600, { step: 10 }),
      num('cin', 'C_in', 'Urea in the blood going in', 'mg/dL', 1, 500, { step: 1 }),
      num('cout', 'C_out', 'Urea in the blood coming out', 'mg/dL', 0.1, 500, { step: 1 }),
      num('k', 'K', 'Clearance', 'mL/min', 0.1, 600, { step: 1 }),
      num('t', 't', 'Session length', 'min', 10, 600, { step: 10 }),
      num('v', 'V', 'Body water', 'L', 5, 100, { step: 1 }),
      num('ktv', 'Kt/V', 'Dose of dialysis', undefined, 0.01, 10, { step: 0.01, figures: 3 }),
      num('urr', 'URR', 'Urea reduction ratio', '%', 0.1, 99.9, { step: 0.1, figures: 3 }),
    ],
    rules: [clearanceRule, ktvRule, urrRule],
    example: example(typed, ['k', kOf], ['ktv', ktvOf], ['urr', urrOf]),
    startWith: ['qb', 'cin', 'cout', 't', 'v'],
    representation: {
      kind: 'dialyzer',
      qb: 'qb',
      cin: 'cin',
      cout: 'cout',
      k: 'k',
      t: 't',
      v: 'v',
      ktv: 'ktv',
      urr: 'urr',
    },
  });

const DIALYZER = dialyzerPage(
  'g.he-dialyzer-clearance',
  'Dialyzer clearance, Kt/V and URR',
  'Use this for “Blood at 300 mL/min enters a dialyzer at 100 mg/dL urea and leaves at 40. What is the clearance, and Kt/V after 4 hours for 40 L of body water?”',
  { qb: 300, cin: 100, cout: 40, t: 240, v: 40 },
);

/** The top of the blood-flow range: a high-flux session. */
const DIALYZER_HIGH = dialyzerPage(
  'g.he-dialyzer-high-flow',
  'A high-flow dialyzer session',
  'Use this for “At Q_b = 500 mL/min, urea falls from 120 to 66 mg/dL across the dialyzer. What are K, Kt/V and the URR for 4 hours and 40 L?”',
  { qb: 500, cin: 120, cout: 66, t: 240, v: 40 },
);

// ─── HC161: X-rays through a slab and an ultrasound echo (bioinstrumentation#2) ─

const shareOf = (v: Values) => 100 * Math.exp(-v.mu! * v.x!);

const beamRules = [
  rule(
    'share',
    '{share} = 100 ÷ e^({mu} × {x})',
    ['share', 'mu', 'x'],
    (v) => v.share! - shareOf(v),
    {
      share: [
        (v) => fin(shareOf(v)),
        '100 ÷ e^({mu} × {x})',
        'Each centimetre keeps the same share of the beam, so what gets through is e^(−μx).',
      ],
      mu: [
        (v) => posOf(Math.log(100 / v.share!) / v.x!),
        'ln(100 ÷ {share}) ÷ {x}',
        'Take the natural log of how many times the beam was cut, then share it over x.',
      ],
      x: [
        (v) => posOf(Math.log(100 / v.share!) / v.mu!),
        'ln(100 ÷ {share}) ÷ {mu}',
        'Take the natural log of how many times the beam was cut, then divide by μ.',
      ],
    },
  ),
  rule('hvl', '{hvl} = ln(2) ÷ {mu}', ['hvl', 'mu'], (v) => v.hvl! * v.mu! - Math.LN2, {
    hvl: [
      (v) => posOf(Math.LN2 / v.mu!),
      'ln(2) ÷ {mu}',
      'The thickness that halves the beam: e^(−μ × HVL) = ½.',
    ],
    mu: [
      (v) => posOf(Math.LN2 / v.hvl!),
      'ln(2) ÷ {hvl}',
      'One half-value layer cuts the beam by ln 2 in the exponent.',
    ],
  }),
];

const beamPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'A narrow beam of one energy: a photon that is scattered leaves the beam.',
      'The slab is one material, so μ is the same at every depth.',
    ],
    variables: [
      num('mu', 'μ', 'Attenuation coefficient', 'cm⁻¹', 0.01, 10, { step: 0.01 }),
      num('x', 'x', 'Thickness', 'cm', 0.01, 100, { step: 0.1 }),
      num('share', 'I ÷ I₀', 'Share transmitted', '%', 0.0001, 100, { step: 0.1 }),
      num('hvl', 'HVL', 'Half-value layer', 'cm', 0.01, 100, { step: 0.01 }),
    ],
    rules: beamRules,
    example: example(typed, ['share', shareOf], ['hvl', (v) => Math.LN2 / v.mu!]),
    startWith: ['mu', 'x'],
    representation: { kind: 'attenuation', mu: 'mu', x: 'x', share: 'share', hvl: 'hvl' },
  });

const BEAM = beamPage(
  'g.he-attenuation-beam',
  'X-rays through tissue: e^(−μx) and the half-value layer',
  'Use this for “Soft tissue has μ = 0.2 per cm. What share of the X-rays gets through 10 cm, and what is its half-value layer?”',
  { mu: 0.2, x: 10 },
);

/** The top of the μ range: seven half-value layers in half a centimetre. */
const BEAM_DENSE = beamPage(
  'g.he-attenuation-dense',
  'A strong absorber: many half-value layers',
  'Use this for “A shield has μ = 10 per cm. What share of the beam gets through 0.5 cm?”',
  { mu: 10, x: 0.5 },
);

const depthOf = (v: Values) => (v.c! * v.t!) / 20000;
const rOf = (v: Values) => 100 * ((v.z2! - v.z1!) / (v.z2! + v.z1!)) ** 2;

const ECHO = page({
  id: 'g.he-attenuation-echo',
  title: 'Ultrasound: the depth of a boundary from its echo',
  use: 'Use this for “An echo returns after 130 μs. How deep is the boundary?”',
  assumptions: [
    'Sound travels at c = 1540 m/s in soft tissue.',
    'The pulse goes straight down and straight back.',
  ],
  variables: [
    num('t', 't', 'Echo time', 'μs', 1, 500, { step: 1 }),
    num('c', 'c', 'Speed of sound', 'm/s', 300, 6000, { step: 10 }),
    num('d', 'd', 'Depth of the boundary', 'cm', 0.01, 40, { step: 0.1 }),
  ],
  rules: [
    rule('depth', '{d} = {c} × {t} ÷ 20000', ['d', 'c', 't'], (v) => 20000 * v.d! - v.c! * v.t!, {
      d: [
        (v) => posOf(depthOf(v)),
        '{c} × {t} ÷ 20000',
        'The pulse goes down and back, so the depth is half of c × t; m/s × μs ÷ 10,000 gives cm.',
      ],
      t: [
        (v) => posOf((20000 * v.d!) / v.c!),
        '20000 × {d} ÷ {c}',
        'The round trip is twice the depth, travelled at c.',
      ],
      c: [
        (v) => posOf((20000 * v.d!) / v.t!),
        '20000 × {d} ÷ {t}',
        'Twice the depth over the time of the round trip.',
      ],
    }),
  ],
  example: example({ t: 130, c: 1540 }, ['d', depthOf]),
  startWith: ['t', 'c'],
  representation: { kind: 'attenuation', mode: 'echo', t: 't', c: 'c', d: 'd' },
});

/** The share a boundary reflects, on the echo drawn for the page's 130 μs at 1540 m/s. */
const ECHO_REFLECT = page({
  id: 'g.he-attenuation-reflect',
  title: 'Ultrasound: the share a boundary reflects',
  use: 'Use this for “What share of the ultrasound does a fat–muscle boundary reflect (Z = 1.38 and 1.70 MRayl)?”',
  assumptions: [
    'The boundary is flat and meets the beam square on.',
    'Each tissue is one acoustic impedance Z = ρc.',
  ],
  variables: [
    num('z1', 'Z₁', 'Impedance above', 'MRayl', 0.0004, 10, { step: 0.01 }),
    num('z2', 'Z₂', 'Impedance below', 'MRayl', 0.0004, 10, { step: 0.01 }),
    out('r', 'R', 'Share reflected', '%'),
  ],
  rules: [
    rule(
      'reflect',
      '{r} = 100 × (({z2} − {z1}) ÷ ({z2} + {z1}))²',
      ['r', 'z1', 'z2'],
      (v) => v.r! - rOf(v),
      {
        r: [
          (v) => fin(rOf(v)),
          '100 × (({z2} − {z1}) ÷ ({z2} + {z1}))^2',
          'The mismatch of the impedances over their sum, squared, is the share of the intensity sent back.',
        ],
      },
    ),
  ],
  example: example({ z1: 1.38, z2: 1.7 }, ['r', rOf]),
  startWith: ['z1', 'z2'],
  representation: {
    kind: 'attenuation',
    mode: 'echo',
    t: 130,
    c: 1540,
    z1: 'z1',
    z2: 'z2',
    r: 'r',
    layers: ['Fat', 'Muscle'],
  },
});

// ─── HC162: a scaffold's porosity and stiffness (tissue-engineering#0) ─────────

const relOf = (v: Values) => v.rhoStar! / v.rhoS!;
const porOf = (v: Values) => 100 * (1 - v.rel!);
const estarOf = (v: Values) => v.es! * v.rel! ** 2;

const scaffoldRules = [
  rule(
    'rel',
    '{rel} = {rhoStar} ÷ {rhoS}',
    ['rel', 'rhoStar', 'rhoS'],
    (v) => v.rel! * v.rhoS! - v.rhoStar!,
    {
      rel: [
        (v) => posOf(relOf(v)),
        '{rhoStar} ÷ {rhoS}',
        'The scaffold weighs this share of the same volume of solid: its solid share.',
      ],
      rhoStar: [
        (v) => posOf(v.rel! * v.rhoS!),
        '{rel} × {rhoS}',
        'Only the solid share of the volume carries the material’s density.',
      ],
      rhoS: [
        (v) => posOf(v.rhoStar! / v.rel!),
        '{rhoStar} ÷ {rel}',
        'The scaffold’s density is the solid share of the material’s.',
      ],
    },
  ),
  rule(
    'porosity',
    '{porosity} = 100 × (1 − {rel})',
    ['porosity', 'rel'],
    (v) => v.porosity! - porOf(v),
    {
      porosity: [(v) => fin(porOf(v)), '100 × (1 − {rel})', 'What is not solid is pore.'],
      rel: [
        (v) => fin(1 - v.porosity! / 100),
        '1 − {porosity} ÷ 100',
        'What is not pore is solid.',
      ],
    },
  ),
  rule(
    'stiffness',
    '{estar} = {es} × {rel}²',
    ['estar', 'es', 'rel'],
    (v) => v.estar! - estarOf(v),
    {
      estar: [
        (v) => fin(estarOf(v)),
        '{es} × {rel}^2',
        'An open-cell foam bends at its struts, so its stiffness falls as the relative density squared (Gibson–Ashby).',
      ],
      es: [
        (v) => posOf(v.estar! / v.rel! ** 2),
        '{estar} ÷ {rel}^2',
        'Undo the square of the relative density.',
      ],
      rel: [
        (v) => posOf(Math.sqrt(v.estar! / v.es!)),
        'sqrt({estar} ÷ {es})',
        'The stiffness share is the relative density squared: take its square root.',
      ],
    },
  ),
];

const scaffoldPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'An open-cell foam: the struts bend under load (Gibson–Ashby).',
      'The pores connect, and the solid is one material of density ρ_s.',
    ],
    variables: [
      num('rhoS', 'ρ_s', 'Density of the solid', 'g/cm³', 0.5, 10, { step: 0.001 }),
      num('rhoStar', 'ρ∗', 'Density of the scaffold', 'g/cm³', 0.001, 10, { step: 0.001 }),
      num('rel', 'ρ_rel', 'Relative density', undefined, 0.0001, 0.9999, { step: 0.01 }),
      num('porosity', 'P', 'Porosity', '%', 0.01, 99.99, { step: 0.1 }),
      num('es', 'E_s', 'Modulus of the solid', 'MPa', 0.1, 1e6, { step: 1 }),
      num('estar', 'E∗', 'Modulus of the scaffold', 'MPa', 0.0001, 1e6, { step: 0.1 }),
    ],
    rules: scaffoldRules,
    example: example(typed, ['rel', relOf], ['porosity', porOf], ['estar', estarOf]),
    startWith: ['rhoS', 'rhoStar', 'es'],
    representation: {
      kind: 'scaffold',
      rhoS: 'rhoS',
      rhoStar: 'rhoStar',
      relative: 'rel',
      porosity: 'porosity',
      es: 'es',
      estar: 'estar',
    },
  });

const SCAFFOLD = scaffoldPage(
  'g.he-scaffold-pcl',
  'A scaffold’s porosity and stiffness',
  'Use this for “A PCL scaffold (solid 1.145 g/cm³, E = 400 MPa) weighs 0.229 g/cm³. How porous is it, and how stiff?”',
  { rhoS: 1.145, rhoStar: 0.229, es: 400 },
);

/** A very open scaffold: 95% pore, the struts thin. */
const SCAFFOLD_OPEN = scaffoldPage(
  'g.he-scaffold-open',
  'A very porous scaffold',
  'Use this for “A PCL foam is 95% pore. What does it weigh per cm³, and how stiff is it?”',
  { rhoS: 1.145, rhoStar: 0.05725, es: 400 },
);

/** A dense scaffold: 60% solid, small pores between thick struts. */
const SCAFFOLD_DENSE = scaffoldPage(
  'g.he-scaffold-dense',
  'A dense scaffold',
  'Use this for “A hydroxyapatite scaffold (solid 3.16 g/cm³, E = 110,000 MPa) weighs 1.896 g/cm³. How porous and how stiff is it?”',
  { rhoS: 3.16, rhoStar: 1.896, es: 110000 },
);

// ─── HC163: ligand spacing and adhesion (tissue-engineering#1) ─────────────────

const spacingOf = (v: Values) => 1000 / Math.sqrt(v.density!);

const ligandPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'The ligands sit on a square grid.',
      'Focal adhesions need ligands about 70 nm apart or closer (a measured threshold, not derived).',
    ],
    variables: [
      num('density', 'σ', 'Ligand density', 'μm⁻²', 1, 1e5, { step: 1 }),
      num('d', 'd', 'Spacing between ligands', 'nm', 3, 1000, { step: 0.1 }),
    ],
    rules: [
      rule(
        'spacing',
        '{d} = 1000 ÷ √{density}',
        ['d', 'density'],
        (v) => v.d! ** 2 * v.density! - 1e6,
        {
          d: [
            (v) => posOf(spacingOf(v)),
            '1000 ÷ sqrt({density})',
            'Each ligand has a square of 1 ÷ density to itself; its side is the spacing (1 μm is 1000 nm).',
          ],
          density: [
            (v) => posOf(1e6 / v.d! ** 2),
            '1000000 ÷ {d}^2',
            'One ligand per square of side d: a square micrometre holds (1000 ÷ d)² of them.',
          ],
        },
      ),
    ],
    example: example(typed, ['d', spacingOf]),
    startWith: ['density'],
    representation: { kind: 'ligandGrid', density: 'density', spacing: 'd' },
  });

const LIGAND = ligandPage(
  'g.he-ligandGrid-adhere',
  'Ligand spacing: will focal adhesions form?',
  'Use this for “A surface carries 400 RGD ligands per μm². How far apart are they, and will cells form focal adhesions?”',
  { density: 400 },
);

/** Past the threshold: 100 per μm² puts the ligands 100 nm apart. */
const LIGAND_SPARSE = ligandPage(
  'g.he-ligandGrid-sparse',
  'Ligands too far apart to cluster',
  'Use this for “At 100 ligands per μm², how far apart are they? Can integrins cluster?”',
  { density: 100 },
);

/** A crowded surface: 10⁴ per μm², 10 nm apart. */
const LIGAND_DENSE = ligandPage(
  'g.he-ligandGrid-dense',
  'A densely coated surface',
  'Use this for “A surface is coated at 10,000 ligands per μm². What is their spacing?”',
  { density: 10000 },
);

// ─── HC164: oxygen in a bioreactor (tissue-engineering#2) ──────────────────────

const ourOf = (v: Values) => v.q! * v.x! * 1e-6;
const cOf = (v: Values) => v.cStar! - v.our! / v.kla!;
const xMaxOf = (v: Values) => (v.kla! * v.cStar!) / (v.q! * 1e-6);

const bioreactorRules = [
  rule('our', '{our} = {q} × {x} ÷ 1000000', ['our', 'q', 'x'], (v) => 1e6 * v.our! - v.q! * v.x!, {
    our: [
      (v) => posOf(ourOf(v)),
      '{q} × {x} ÷ 1000000',
      'Every cell takes q; a millilitre holds X of them (pmol per mL per hour ÷ 10⁶ is mM/h).',
    ],
    q: [
      (v) => posOf((1e6 * v.our!) / v.x!),
      '1000000 × {our} ÷ {x}',
      'Share the uptake among the cells in a millilitre.',
    ],
    x: [
      (v) => posOf((1e6 * v.our!) / v.q!),
      '1000000 × {our} ÷ {q}',
      'How many cells, each taking q, use oxygen this fast.',
    ],
  }),
  rule(
    'balance',
    '{c} = {cStar} − {our} ÷ {kla}',
    ['c', 'cStar', 'our', 'kla'],
    (v) => v.c! - cOf(v),
    {
      c: [
        (v) => fin(cOf(v)),
        '{cStar} − {our} ÷ {kla}',
        'At steady state the gas supplies k_La(C∗ − C), just what the cells use.',
      ],
      cStar: [
        (v) => posOf(v.c! + v.our! / v.kla!),
        '{c} + {our} ÷ {kla}',
        'The shortfall below saturation drives the supply.',
      ],
      our: [
        (v) => posOf(v.kla! * (v.cStar! - v.c!)),
        '{kla} × ({cStar} − {c})',
        'The supply k_La(C∗ − C) is what the cells take.',
      ],
      kla: [
        (v) => posOf(v.our! / (v.cStar! - v.c!)),
        '{our} ÷ ({cStar} − {c})',
        'The supply rate over the shortfall below saturation.',
      ],
    },
  ),
  rule(
    'xmax',
    '{xMax} = {kla} × {cStar} × 1000000 ÷ {q}',
    ['xMax', 'kla', 'cStar', 'q'],
    (v) => v.xMax! - xMaxOf(v),
    {
      xMax: [
        (v) => posOf(xMaxOf(v)),
        '{kla} × {cStar} × 1000000 ÷ {q}',
        'The most the gas can feed: C falls to 0 when qX reaches k_La·C∗.',
      ],
    },
  ),
];

const bioreactorPage = (id: string, title: string, use: string, typed: Values) =>
  page({
    id,
    title,
    use,
    assumptions: [
      'Steady state: the gas supplies oxygen as fast as the cells use it.',
      'The medium is well mixed, so C is the same everywhere.',
    ],
    variables: [
      num('cStar', 'C∗', 'Oxygen at saturation', 'mM', 0.01, 2, { step: 0.01 }),
      num('kla', 'k_La', 'Oxygen transfer coefficient', 'h⁻¹', 0.1, 100, { step: 0.1 }),
      num('q', 'q', 'Uptake per cell', 'pmol/(cell·h)', 0.001, 10, { step: 0.01 }),
      num('x', 'X', 'Cell density', 'cells/mL', 1000, 1e9, { step: 1000, scientific: true }),
      out('our', 'OUR', 'Oxygen uptake rate', 'mM/h'),
      num('c', 'C', 'Dissolved oxygen', 'mM', 0, 2, { step: 0.01 }),
      out('xMax', 'X_max', 'Highest cell density the gas can feed', 'cells/mL', {
        scientific: true,
      }),
    ],
    rules: bioreactorRules,
    example: example(typed, ['our', ourOf], ['c', cOf], ['xMax', xMaxOf]),
    startWith: ['cStar', 'kla', 'q', 'x'],
    representation: {
      kind: 'bioreactor',
      cStar: 'cStar',
      kla: 'kla',
      q: 'q',
      x: 'x',
      our: 'our',
      c: 'c',
      xMax: 'xMax',
    },
  });

const BIOREACTOR = bioreactorPage(
  'g.he-bioreactor-steady',
  'Oxygen in a bioreactor at steady state',
  'Use this for “C∗ = 0.21 mM, k_La = 5 per hour, and 2 × 10⁶ cells/mL each take 0.2 pmol/h. What is the dissolved oxygen, and how many cells can the vessel feed?”',
  { cStar: 0.21, kla: 5, q: 0.2, x: 2e6 },
);

/** Near the limit: 5 × 10⁶ cells/mL leave almost no oxygen. */
const BIOREACTOR_CROWDED = bioreactorPage(
  'g.he-bioreactor-crowded',
  'A bioreactor near its oxygen limit',
  'Use this for “At 5 × 10⁶ cells/mL, each taking 0.2 pmol/h, with k_La = 5 per hour and C∗ = 0.21 mM, how much oxygen is left?”',
  { cStar: 0.21, kla: 5, q: 0.2, x: 5e6 },
);

export const HE4K_GALLERY_MODULES: ModuleDef[] = [
  DIALYZER,
  DIALYZER_HIGH,
  BEAM,
  BEAM_DENSE,
  ECHO,
  ECHO_REFLECT,
  SCAFFOLD,
  SCAFFOLD_OPEN,
  SCAFFOLD_DENSE,
  LIGAND,
  LIGAND_SPARSE,
  LIGAND_DENSE,
  BIOREACTOR,
  BIOREACTOR_CROWDED,
];

export const HE4K_GALLERY_LAYOUTS: LayoutDef[] = [];
