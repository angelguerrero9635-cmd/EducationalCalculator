/**
 * College pictures, round 3, group G (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

/**
 * `pages` is the page list, or, for a request whose parts go on different pages (and kinds), each
 * page with the text that shows its part is there (`uses`).
 */
const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[] | Record<string, string>,
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  ...(Array.isArray(pages) ? { pages } : { pages: Object.keys(pages), uses: pages }),
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

const P = 'he.physics.';
const C = 'he.chemistry.';
const B = 'he.biology.';

export const HE3G_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC43',
      'gasPiston',
      'The piston beside its P–V diagram (isothermal, adiabatic, isobaric, isochoric or a cycle, the work shaded with its sign, isotherms dashed); a van der Waals gas with its own volume, attraction and two gauges',
      [
        `${P}thermal-statistical#0`,
        `${P}thermal-statistical#0~adiabatic`,
        `${C}physical-1#0`,
        `${C}physical-1#0~adiabatic`,
        `${C}gen-chem-1#2~real-gas`,
      ],
      [
        'From P-P27 and C-P11 (pv) and C-P10 (real). Types in typesHe3g.ts, drawn by reps/GasPistonPv.tsx and reps/GasPistonReal.tsx (cylinder and gauge in reps/gasHe3gKit.tsx, sums in reps/gasPvMath.ts), routed by one line each in reps/hsjView.tsx.',
        "Fields: gasPiston (law: 'ideal') with pv: { path: 'isothermal' | 'adiabatic' | 'isobaric' | 'isochoric' | 'cycle', v1, v2, p1?, p2?, t1?, t2?, moles?, R? (default 8.314 J/(mol·K); 0.08206 gives atm and L·atm), gamma? or cv? (adiabat), work?, heat?, sign?: 'by' (physics W, default) | 'on' (chemistry w), units?: { pressure, work }, corners?: [{ volume, pressure? | temperature? }] and legs? (cycle), keep?, fixed? }; or volume, temperature, moles, R? with real: { a, b, ideal? (P ideal), pressure? (P), z?, gas? }.",
        "Example (thermal-statistical#0): { kind: 'gasPiston', law: 'ideal', pv: { path: 'isothermal', v1: 'V1', v2: 'V2', t1: 'T', moles: 'n', work: 'W', heat: 'Q' } }. Example (physical-1#0~adiabatic): pv: { path: 'adiabatic', v1: 'V1', v2: 'V2', t1: 'T1', t2: 'T2', moles: 'n', cv: 'cv', work: 'w', sign: 'on' }. Example (gen-chem-1#2~real-gas): { kind: 'gasPiston', law: 'ideal', volume: 'V', temperature: 'T', moles: 'n', R: 0.08206, real: { a: 'a', b: 'b', ideal: 'Pid', pressure: 'P', z: 'Z', gas: 'CO₂' } }. The later thermal-statistical#0~cycle passes path: 'cycle' with corners and legs (demo g.he-gasPiston-pv-cycle).",
        'Volumes in L give P in kPa (kPa × L = J). A "?" draws nothing for its state; drag state 2 along the path (v2). Harness (harness/picturesHe3g.ts): shaded area = |W| to 0.1%, W as the page has it (by or on), PV = nRT at each end, P₂ and T₂ by the path, cycle corners on their legs; P ideal, the van der Waals P and Z.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-gasPiston-pv-isothermal',
      'g.he-gasPiston-pv-chemistry',
      'g.he-gasPiston-pv-compress',
      'g.he-gasPiston-pv-adiabatic',
      'g.he-gasPiston-pv-adiabatic-diatomic',
      'g.he-gasPiston-pv-isobaric',
      'g.he-gasPiston-pv-isochoric',
      'g.he-gasPiston-pv-cycle',
      'g.he-gasPiston-real-co2',
      'g.he-gasPiston-real-h2',
    ],
  },
  {
    ...ask(
      'HC44',
      'energyProfile',
      'Free energy (ΔG, ΔG°′) on the profile and the ladder, coupled steps with the ATP step and the net arrow; a mechanism of 2–3 humps with intermediates and the rate-determining step; a bomb calorimeter',
      [
        `${B}principles-1#2`,
        `${B}principles-1#2~delta-g`,
        `${C}organic-1#2~energy-diagram`,
        `${C}gen-chem-1#3~bomb`,
        `${C}biochemistry#3~coupled`,
      ],
      [
        'From B-P2 and C-P15. Types in typesHe3g.ts; quantity is one field on the profile (typesHsj.ts) and the ladder (typesHs2d.ts), drawn by EnergyProfile.tsx and EnergyLadder.tsx; steps by reps/EnergySteps.tsx and the bomb by reps/EnergyBomb.tsx (sums in reps/energyHe3gMath.ts), routed in reps/hsjView.tsx.',
        "Fields: quantity?: 'H' | 'G' | 'G°' | 'G°′' (profile or mode 'ladder': ΔG names, a G axis, 'runs forward on its own' for a drop; with G a \"?\" level or step draws nothing and chips leave the unit to the axis). steps?: { intermediates: [ids], barriers: [ids of steps 2…], tops?: [ids], highest?, names?: [intermediate names] } on the profile (activation is step 1's Eₐ). mode: 'bomb' with constant (C_cal, kJ/°C), change (ΔT), q?, sample?: { name?, mass?, moles?, molar? }, deltaU?, deltaH?, gas? (Δn_g), temperature?, R? (0.008314 kJ/(mol·K)).",
        "Example (principles-1#2): { kind: 'energyProfile', mode: 'ladder', quantity: 'G', unit: 'kJ/mol', levels: [{ name: 'Glu + NH₃ + ATP', value: 0 }, { name: 'Gln + ATP' }, { name: 'Gln + ADP + Pᵢ' }], steps: [{ from: 0, to: 1, value: 'dG1', label: 'ΔG₁' }, { from: 1, to: 2, value: 'dGA', label: 'ATP' }], total: { from: 0, to: 2, value: 'dG', label: 'ΔG' } }. ~delta-g: the same ladder with steps ΔG°′ and 'RT ln Q'. biochemistry#3~coupled: quantity: 'G°′'. Example (organic-1#2~energy-diagram): { kind: 'energyProfile', reactants: 0, products: 'P', activation: 'Ea1', deltaH: 'dH', names: { reactants: 'R–Br', products: 'R–Nu' }, steps: { intermediates: ['I1'], barriers: ['Ea2'], tops: ['T1', 'T2'], highest: 'hi', names: ['R⁺'] } } (hi a derived value). Example (gen-chem-1#3~bomb): { kind: 'energyProfile', mode: 'bomb', constant: 'C', change: 'dT', q: 'q', sample: { name: 'naphthalene', mass: 'm', moles: 'n', molar: 'M' }, deltaU: 'dU', deltaH: 'dH', gas: 'dng', temperature: 'T' }.",
        "Harness (harness/picturesHe3g.ts, plus the ladder's own sum check): each hump's top = the level before + its Eₐ, the tops and the highest as named, ΔH = products − reactants; the bomb's q = C_cal ΔT, ΔU = −q ÷ n, ΔH = ΔU + Δn_g RT, n = m ÷ M. Existing pages are unchanged (every option is off unless set).",
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-energyProfile-coupled',
      'g.he-energyProfile-coupled-short',
      'g.he-energyProfile-coupled-k',
      'g.he-energyProfile-delta-g',
      'g.he-energyProfile-steps-sn1',
      'g.he-energyProfile-steps-three',
      'g.he-energyProfile-bomb',
      'g.he-energyProfile-bomb-octane',
    ],
  },
  {
    ...ask(
      'HC57',
      'organelleEnergy',
      'A pathway step by step (glycolysis, the citric acid cycle, the electron transport chain): each step’s enzyme, substrate and product with their carbons, what it makes or uses, tallied; and a stage card drawing one step',
      {
        [`${C}biochemistry#2`]:
          'Glycolysis sequence: each stage a pathwayStep card (glycolysis, steps 1–10).',
        [`${C}biochemistry#2~krebs`]:
          'Citric acid cycle sequence: each stage a pathwayStep card (krebs, steps 1–8).',
        [`${C}biochemistry#2~atp-yield`]:
          'The ETC detail (per NADH 2.5 ATP, per FADH₂ 1.5) on an organelleEnergy explore page linked from it, or as its figure once HE-E2 gives calculators a layout figure.',
        [`${C}biochemistry#2~beta-oxidation`]:
          'The citric acid cycle detail (3 NADH, 1 FADH₂, 1 GTP per acetyl-CoA) beside it, as for ~atp-yield.',
      },
      [
        'From C-P20. Types and the pathway data (PATHWAYS, pathwayTally, PROTONS_PER_ATP) in typesHe3g.ts; the detail drawn by layouts/pathwayFigure.tsx (routed by one line in ExploreLayout.tsx when a scene sets energy.detail), the card by layouts/pathwayCard.tsx (registered in CardFigure.tsx and layouts/types.ts).',
        "Fields: explore figure { kind: 'organelleEnergy' } with scene energy: { detail: 'glycolysis' | 'krebs' | 'etc', step? } (step lights that row, fades the later ones and tallies to it). Card figure { kind: 'pathwayStep', pathway: 'glycolysis' | 'krebs', step } (112 × 76): carbons as dots, phosphates orange, CoA a tag, an aldolase split as two 3C chains, chips for ATP, GTP, NADH, FADH₂ and CO₂ made (+) or used (− dashed).",
        "Example (biochemistry#2): stages: [{ label: 'Hexokinase: glucose → glucose 6-phosphate (uses ATP)', figure: { kind: 'pathwayStep', pathway: 'glycolysis', step: 1 } }, …]. Example scene: { label: 'The first NADH', lines: […], energy: { detail: 'glycolysis', step: 6 } }.",
        'Layout check (harness/layoutFiguresHe3g.ts): glycolysis nets 2 ATP and 2 NADH per glucose; a turn makes 3 NADH, 1 FADH₂, 1 GTP, 2 CO₂ and ends at OAA; carbon in = carbon out + CO₂ at every step; 10 H⁺ ÷ 4 = 2.5 ATP per NADH, 6 ÷ 4 = 1.5 per FADH₂; cards one pathway, steps in order; a scene’s step in range.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-organelleEnergy-glycolysis',
      'g.he-organelleEnergy-krebs-etc',
      'g.he-pathwayStep-glycolysis',
      'g.he-pathwayStep-krebs',
    ],
  },
];
