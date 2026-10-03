/**
 * College pictures, round 3, group E (docs/RENDERINGS_HE.md). Spread into
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

const C = 'he.chemistry.';

export const HE3E_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC55',
      'instrumentTrace',
      'Instrument traces computed from peak lists: a ¹H NMR spectrum with n + 1 multiplets and integrals, a chromatogram with R, a rotational spectrum 2B apart; and the `ir` card',
      {
        [`${C}organic-1#4`]: '"nmr"',
        [`${C}organic-1#4~ir-bands`]: '"ir"',
        [`${C}analytical#3`]: '"chromatogram"',
        [`${C}physical-2#4`]: '"rotational"',
      },
      [
        'From C-P5 (typesHe3e.ts, reps/InstrumentTrace.tsx, the sums in reps/instrumentTraceMath.ts; the card in layouts/irCard.tsx). Every trace is computed from its values, never traced from a real spectrum.',
        "Fields: { kind: 'instrumentTrace', mode: 'nmr', signals: [{ shift (δ, ppm), neighbors (n), integral?, count? (H, checked = H × I ÷ ΣI), atoms? (numbers in smiles) }], hydrogens? (H), smiles? (the structure drawn above, lettered a, b, c), name?, coupling? (J, Hz), field? (ν₀, MHz) } | { mode: 'chromatogram', dead (t_M), peaks: [{ time, width, name? }], resolution? (R), factors? ([k₁, k₂]), selectivity? (α), plates? (N of peak 2) } | { mode: 'rotational', constant (B, cm⁻¹), temperature? (K, default 298.15), lower? (J lit), line? (ν̃), spacing? (2B), name? }. Card: { kind: 'ir', bands: [{ at, to? (a very broad range), strength?: 'strong' | 'medium' | 'weak', shape?: 'sharp' | 'broad' }] }.",
        "Example (organic-1#4): { kind: 'instrumentTrace', mode: 'nmr', smiles: 'CC(=O)OCC', hydrogens: 'H', signals: [{ shift: 2.03, neighbors: 0, integral: 'I1', count: 'h1', atoms: [0] }, { shift: 4.12, neighbors: 3, integral: 'I2', count: 'h2', atoms: [4] }, { shift: 1.26, neighbors: 2, integral: 'I3', count: 'h3', atoms: [5] }] }. Example (analytical#3): { kind: 'instrumentTrace', mode: 'chromatogram', dead: 'tM', peaks: [{ time: 't1', width: 'w1' }, { time: 't2', width: 'w2' }], resolution: 'R', factors: ['k1', 'k2'], selectivity: 'alpha', plates: 'N' }. Example (physical-2#4): { kind: 'instrumentTrace', mode: 'rotational', constant: 'B', lower: 'J', line: 'nu' }. Card: { kind: 'ir', bands: [{ at: 2960, strength: 'medium' }, { at: 1715 }] }.",
        'The δ axis runs from 0 to a whole ppm past the highest signal (5 to 12); multiplet lines closer than 5 px are drawn 5 px apart (the caption says so). Peaks far past t_M break the time axis. A "?" draws nothing for its value.',
        'Checks (harness/picturesHe3e.ts): n + 1 lines centered on δ adding to the integral; count = H × I ÷ ΣI; atoms named exist and carry H; R, k, α and N from the formulas; each tangent triangle w wide about t; lines at 2B(J + 1), 2B apart; the lit line; ir bands inside 4000–400 cm⁻¹, 1 to 6 a card.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-instrumentTrace-nmr',
      'g.he-instrumentTrace-nmr-septet',
      'g.he-instrumentTrace-chromatogram',
      'g.he-instrumentTrace-chromatogram-overlap',
      'g.he-instrumentTrace-rotational',
      'g.he-instrumentTrace-rotational-hot',
      'g.he-instrumentTrace-ir-cards',
    ],
  },
  {
    ...ask(
      'HC70',
      'orbitalDiagram',
      'Molecular orbitals: a second-period diatomic’s MO diagram filled (bond order, magnetism), a heteronuclear pair’s E± from the 2 × 2 determinant, and a Hückel ring’s Frost circle',
      {
        [`${C}gen-chem-1#4~bond-order`]: "mode mo, view 'diatomic'",
        [`${C}physical-2#3`]: "mode mo, view 'heteronuclear' (replaces the interim matrixGrid)",
        [`${C}physical-2#3~huckel`]: "mode mo, view 'frost'",
      },
      [
        'From C-P3 (typesHe3e.ts OrbitalMoSpec, reps/OrbitalMo.tsx, the sums in reps/orbitalMoMath.ts; one hook line in OrbitalDiagram.tsx). Off unless a page sets mode: mo; boxes and ladder are unchanged.',
        "Fields: { kind: 'orbitalDiagram', mode: 'mo', view: 'diatomic' | 'heteronuclear' | 'frost', electrons? (valence electrons 2–16 for diatomic; electrons in the pair, default 2, for heteronuclear; π electrons for frost), formula? ('O2', 'N2+'; default the neutral molecule), bonding?, antibonding?, bondOrder?, unpaired?, alphaA?, alphaB?, beta? (eV, β < 0), plus? (E₊), minus? (E₋), splitting?, atoms? (['A', 'B'] names), ring? (N, 3–8), energy? (π energy beyond Nα, in β), isolated? (in β), delocalization? }.",
        "Example (gen-chem-1#4~bond-order): { kind: 'orbitalDiagram', mode: 'mo', view: 'diatomic', formula: 'O2', electrons: 'e', bonding: 'b', antibonding: 'a', bondOrder: 'BO', unpaired: 'u' }. Example (physical-2#3): { kind: 'orbitalDiagram', mode: 'mo', view: 'heteronuclear', alphaA: 'aA', alphaB: 'aB', beta: 'beta', plus: 'Ep', minus: 'Em', splitting: 'dE' }. Example (physical-2#3~huckel): { kind: 'orbitalDiagram', mode: 'mo', view: 'frost', ring: 'N', electrons: 'e', energy: 'Epi', isolated: 'iso', delocalization: 'deloc', unpaired: 'u' }.",
        'Diatomic: s–p mixing (π2p below σ2p) through 10 electrons, the other order from 11 (O₂⁺ on); the atoms’ own 2s and 2p electrons drawn only for the neutral molecule. Step phrases for the lookups (harness/phrasesHe3e.ts): “bonding electrons of 12”, “antibonding electrons of 12”, “unpaired MO electrons of 12”, “Hückel energy of 6 electrons in a ring of 6”, “unpaired ring electrons of 4 in a ring of 4”.',
        'Checks (harness/picturesHe3e.ts): electrons drawn = electrons, at most two an orbital; bonding, antibonding, bond order and unpaired from the filling; E± roots of the determinant, E₊ below both AOs and E₋ above, splitting; Frost levels 2β cos(2πk ÷ N), the π energy, isolated, delocalization and unpaired.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-orbitalDiagram-mo-diatomic',
      'g.he-orbitalDiagram-mo-diatomic-ion',
      'g.he-orbitalDiagram-mo-heteronuclear',
      'g.he-orbitalDiagram-mo-frost',
      'g.he-orbitalDiagram-mo-frost-antiaromatic',
    ],
  },
  {
    ...ask(
      'HC72',
      'vsepr',
      'Molecular shape with 5–6 electron domains (lone pairs equatorial in 5, trans in 6) and the hybrid named; a metal complex with its ligands placed cis, trans, fac or mer',
      {
        [`${C}gen-chem-1#4`]: "mode 'expanded': the shape, θ and the hybrid from V, b and o",
        [`${C}inorganic#1`]: "mode 'complex': the metal, its ligands and the coordination number",
        [`${C}inorganic#1~isomers`]:
          "mode 'complex' with isomer (the sort's cards stay text until a complex card is asked for)",
      },
      [
        'From C-P13 (typesHe3e.ts VseprExpandedSpec and VseprComplexSpec, reps/VseprHe3e.tsx, the geometry in reps/vseprHe3eMath.ts; one hook line in Vsepr.tsx). Off unless a page sets mode expanded or complex; shape and hbonds are unchanged.',
        "Fields: { kind: 'vsepr', mode: 'expanded', bonded (b, 2–6), lone (l, 0–3), angle? (θ, the smallest ideal angle between domains, checked), domains? (d = b + l, checked), central?, outer?, formula? (another molecule than the shape's example) } | { kind: 'vsepr', mode: 'complex', complex: { metal, geometry: 'octahedral' | 'squarePlanar' | 'tetrahedral', ligands: [{ name, count, donor }] (one or two, the majority first), isomer?: 'cis' | 'trans' | 'fac' | 'mer', formula? }, coordination? (CN, checked) }.",
        "Example (gen-chem-1#4): { kind: 'vsepr', mode: 'expanded', bonded: 'b', lone: 'l', angle: 'theta', domains: 'd' } with V = 36, b = 4, o = 24 (XeF₄). Example (inorganic#1): { kind: 'vsepr', mode: 'complex', complex: { metal: 'Co', geometry: 'octahedral', ligands: [{ name: 'NH3', count: 5, donor: 'N' }, { name: 'Cl', count: 1, donor: 'Cl' }], formula: '[Co(NH3)5Cl]2+' }, coordination: 'CN' }.",
        'Shapes drawn: linear, trigonal planar, bent, tetrahedral, trigonal pyramidal; trigonal bipyramidal, seesaw, T-shaped, linear (5); octahedral, square pyramidal, square planar (6), each with an example molecule (PCl₅, SF₄, ClF₃, XeF₂, SF₆, BrF₅, XeF₄). An isomer the ligands cannot make draws faded with the reason. Step phrase: “smallest angle between 6 domains” (harness/phrasesHe3e.ts).',
        'Checks (harness/picturesHe3e.ts): lone pairs equatorial in 5 domains and trans in 6; the domains drawn at least θ apart; θ and d; ligands = places; cis 90°, trans 180°, fac three at 90°, mer one pair trans; CN = the ligands drawn.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-vsepr-expanded',
      'g.he-vsepr-expanded-seesaw',
      'g.he-vsepr-expanded-linear',
      'g.he-vsepr-complex-cis',
      'g.he-vsepr-complex-mer',
      'g.he-vsepr-complex-trans',
    ],
  },
  {
    ...ask(
      'HC74',
      'moleMap',
      'Mole-map boxes for a solution (M × L → mol) and a gas (V = nRT ÷ P at any T and P) at either end of the chain; and the combustion train with the CₓHᵧO_z formula worked out from the values',
      {
        [`${C}gen-chem-1#1~solution-stoich`]: '"solution"',
        [`${C}gen-chem-1#2~gas-stoich`]: '"gas"',
        [`${C}gen-chem-1#1`]: '"combustion"',
      },
      [
        'From C-P24 (typesHe3e.ts MoleMapHe3e and CombustionTrain, reps/MoleMapHe3e.tsx, reps/CombustionTrain.tsx, the sums in reps/moleHe3eMath.ts; one dispatch line each in reps/hsi.tsx and reps/index.tsx). Off unless a page sets solution, gas or combustion; the Grades 9–12 mole map, limiting map and reaction are unchanged.',
        "Fields: moleMap { …, solution?: { first?: { molarity, volume }, second?: { molarity, volume } } (volume in mL or L by its variable’s unit), gas?: { temperature (K), pressure (atm), volume (L), R? (default 0.08206), of?: 'first' | 'second' (default second) } }; the chain is outer box → moles → ratio (second.ratio) → moles → outer box, an outer box being the solution, the gas or the mass. reaction { kind: 'reaction', reactants: [], products: [], combustion: { sample (g), co2 (g), h2o (g), carbon? (n_C), hydrogen? (n_H), oxygenMass? (m_O), oxygen? (n_O), hPerC?, oPerC?, masses? ({ co2, h2o, c, h, o } molar masses; defaults 44.01, 18.02, 12.01, 1.008, 16.00) } }.",
        "Example (gen-chem-1#1~solution-stoich): { kind: 'moleMap', moles: 'n1', formula: 'H2SO4', second: { formula: 'NaOH', ratio: [1, 'r'], moles: 'n2' }, solution: { first: { molarity: 'C1', volume: 'V1' }, second: { molarity: 'C2', volume: 'V2' } } }. Example (gen-chem-1#2~gas-stoich): { kind: 'moleMap', moles: 'n1', mass: 'm', formula: 'KClO3', second: { formula: 'O2', ratio: [1, 'r'], moles: 'n2' }, gas: { temperature: 'T', pressure: 'P', volume: 'V' } }. Example (gen-chem-1#1): { kind: 'reaction', reactants: [], products: [], combustion: { sample: 'm', co2: 'mCO2', h2o: 'mH2O', carbon: 'nC', hydrogen: 'nH', oxygenMass: 'mO', oxygen: 'nO', hPerC: 'rH', oPerC: 'rO' } }.",
        'Demos are metric only (unitSystems). The train is painted (glass tubes, the furnace and its coil, the absorbers’ granules); the map and the bars are flat. A formula no multiplier up to 6 makes whole, or C and H heavier than the sample, is named instead of a formula.',
        'Checks (harness/picturesHe3e.ts): n = CV and V = n ÷ C (mL or L), V = nRT ÷ P, with the ratio check of the Grades 9–12 map; n_C, n_H, m_O, n_O and the ratios from the masses; m_O not below zero; C, H and O balance in the drawn combustion.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-moleMap-solution',
      'g.he-moleMap-gas',
      'g.he-moleMap-gas-solution',
      'g.he-reaction-combustion',
      'g.he-reaction-combustion-hydrocarbon',
    ],
  },
];
