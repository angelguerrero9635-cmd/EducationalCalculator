/**
 * College pictures, round 4, group D (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[],
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  pages,
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

export const HE4D_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC109',
      'orbitalDiagram',
      'orbitalDiagram ladder with Z: a hydrogen-like ion’s levels −13.6Z² ÷ n² to scale, the page’s level lit, the shell’s n² orbitals at one energy (subshell l lit) and a slice through one orbital with its radial nodes as rings and angular nodes as lines, lobes signed + and −; mode radial: P(r) = r²R²(r) against r in a₀, area 1 shaded, the radial nodes, ⟨r⟩ dashed, r_mp ringed',
      ['he.chemistry.physical-2#2', 'he.chemistry.physical-2#2~radius'],
      [
        'From C-P2. Types in typesHe4d.ts (OrbitalLadderZ, OrbitalRadial); the Grades 9–12 boxes and ladder are unchanged (a ladder without Z draws as before).',
        'Ladder: { kind: "orbitalDiagram", mode: "ladder", Z, n, l?, energy? (eV), radial?, angular?, degeneracy?, rydberg? (default 13.6) }. physical-2#2 main: { mode: "ladder", Z: "Z", n: "n", l: "l", energy: "E", radial: "rad", angular: "ang", degeneracy: "g" } (He⁺ 2p: −13.6 eV, 0 and 1 nodes, g = 4).',
        'Radial: { kind: "orbitalDiagram", mode: "radial", Z, n, l, mean? (a₀), meanNm? (nm), peak? (a₀), peakNm? (nm), nodes? }. ~radius: { mode: "radial", Z: "Z", n: "n", l: "l", mean: "mean", meanNm: "meanNm", peak: "peak", peakNm: "peakNm" } (H 2p: ⟨r⟩ = 5a₀ = 0.265 nm, r_mp = 4a₀ = 0.212 nm). The peak drawn is always the tallest hump; pass `peak` only where the page’s relation is r_mp = n²a₀ ÷ Z (l = n − 1).',
        'Z 1–10, n 1–10, l < n. Checks (harness/picturesHe4d.ts): E = −13.6Z²/n²; radial = n − l − 1; angular = l; g = n²; area under P(r) = 1; the curve’s node count = n − l − 1; ⟨r⟩ from the curve = (3n² − l(l + 1)) ÷ 2Z; r_mp = n² ÷ Z when l = n − 1; nm = a₀ × 0.0529177.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-orbitalDiagram-ladder-z',
      'g.he-orbitalDiagram-ladder-z-high',
      'g.he-orbitalDiagram-radial',
      'g.he-orbitalDiagram-radial-3s',
    ],
  },
  {
    ...ask(
      'HC110',
      'orbitalDiagram',
      'orbitalDiagram mode crystalField: the five free-ion d boxes split into t₂g and e_g by Δₒ, drawn to scale beside a bar of the pairing energy P, filled high or low spin (each electron where it costs least); tetrahedral (e below t₂) and square planar (four levels) by `geometry`; CFSE and the spin-only μ worked in the caption',
      ['he.chemistry.inorganic#2', 'he.chemistry.inorganic#1'],
      [
        'From C-P4. Type in typesHe4d.ts (OrbitalCrystalField).',
        'Fields: { kind: "orbitalDiagram", mode: "crystalField", d, split (Δ), pairing (P), geometry?: "octahedral" (default) | "tetrahedral" | "squarePlanar", t2g? (the lower set’s electrons), eg? (the upper set’s), unpaired?, cfse?, moment? (BM), ion?: "Fe²⁺", ligand?: "H₂O", unit? (default "cm⁻¹") }.',
        'inorganic#2 main: { mode: "crystalField", d: "d", split: "split", pairing: "P", t2g: "t2g", eg: "eg", unpaired: "n", cfse: "cfse", moment: "mu", ion: "Fe²⁺", ligand: "H₂O" } (d⁶, 10,400 < 17,600 → t₂g⁴e_g², 4 unpaired, −4160 cm⁻¹, 4.90 BM; with CN⁻ at 33,000 → t₂g⁶, −44,000 cm⁻¹). inorganic#1 may show its d count the same way with fixed split and pairing, or leave it for the crystal-field page.',
        'Checks (harness/picturesHe4d.ts): the boxes hold d electrons; octahedral d⁴–d⁷ low spin exactly when Δ > P; lower and upper counts, unpaired, CFSE = Σ(nᵢ × energyᵢ)Δ + (pairs beyond max(0, d − 5)) × P and μ = √(n(n + 2)) agree with the values.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-orbitalDiagram-crystal-field',
      'g.he-orbitalDiagram-crystal-field-low',
      'g.he-orbitalDiagram-crystal-field-tetrahedral',
    ],
  },
  {
    ...ask(
      'HC111',
      'lewisStructure',
      'lewisStructure formal charges, resonance and expanded octets: every atom’s FC = v − N − B ÷ 2 circled beside it (signed), the atom with the page’s v, N and B ringed in each form, an ion in brackets; resonance forms two to a row joined by double-headed arrows (NO₃⁻, NO₂⁻, CO₃²⁻, O₃, SO₄²⁻ 3 of 6); expanded octets PCl₅, SF₄, SF₆, ClF₃, XeF₄, I₃⁻ named in the caption',
      ['he.chemistry.gen-chem-1#4~formal-charge'],
      [
        'From C-P12. New fields on the molecule mode (typesHsi.ts, typed in typesHe4d.ts): formal?: { valence?, nonbonding?, bonding?, charge?, atom? (an index, used while the values are "?") }, resonance?: boolean. Structures by `formula` from reps/lewisHe4d.ts: "NO3-", "NO2-", "CO3 2-", "O3", "SO4 2-", "PCl5", "SF4", "SF6", "ClF3", "XeF4", "I3-" (and any Grades 9–12 formula, one form). Pages without these fields draw as before.',
        '~formal-charge: { kind: "lewisStructure", mode: "molecule", formula: "NO3-", resonance: true, formal: { valence: "v", nonbonding: "N", bonding: "B", charge: "FC" } } (N: 5 − 0 − 8 ÷ 2 = +1; a single-bonded O: 6 − 6 − 2 ÷ 2 = −1, ringed in each form where it sits). The page may swap formula for O3 or I3- in other examples.',
        'Checks (harness/picturesHe4d.ts): each drawn form holds the valence electrons V (charge counted); its formal charges add to the ion’s charge; no second-period atom passes 8; FC = v − N − B ÷ 2.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-lewisStructure-formal',
      'g.he-lewisStructure-formal-ozone',
      'g.he-lewisStructure-formal-expanded',
    ],
  },
  {
    ...ask(
      'HC112',
      'beaker',
      'beaker cuvette: a lamp’s beam I₀ through a painted glass cuvette of path b (to scale up to 2.5 cm), narrowing inside the solution as 10^(−A·x ÷ b) so it reaches the detector T times as wide; the solution tinted by εc; A and %T over it, A = εbc and %T = 100 × 10^(−A) in the caption',
      ['he.chemistry.analytical#2'],
      [
        'From C-P16. Type BeakerCuvette in typesHe4d.ts: { kind: "beaker", cuvette: { path (cm), absorbance?, transmittance? (%), absorptivity? (L/(mol·cm)), concentration? (M) } }. The jug and solution beakers are unchanged.',
        'analytical#2 main (replacing the interim functionGraph, or beside it): { kind: "beaker", cuvette: { path: "b", absorbance: "A", transmittance: "T", absorptivity: "eps", concentration: "c" } } (1.20 × 10⁴, 1.00 cm, 4.00 × 10⁻⁵ M → A = 0.480, %T = 33.1%).',
        'Checks (harness/picturesHe4d.ts): %T = 100 × 10^(−A); A = εbc; the beam leaving is T times as wide; b > 0, 0 < %T ≤ 100.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-beaker-cuvette', 'g.he-beaker-cuvette-dark'],
  },
  {
    ...ask(
      'HC113',
      'symmetryElements',
      'Explore figure symmetryElements: a ball-and-stick molecule in 3-D (H₂O, CH₂Cl₂, NH₃, BF₃, PCl₅, CH₄, XeF₄, SF₆, CO₂, trans-N₂F₂) with one symmetry element lit: a Cₙ axis with its turn, a σ pane, the centre i with the pairs it swaps, or Sₙ (axis and pane); and molecule card formulas for the point-group sort (PCl₃, PCl₅, SF₆, XeF₄, [PtCl₄]²⁻, [Fe(CN)₆]⁴⁻, HCN, C₂H₂, CH₂Cl₂, N₂F₂)',
      ['he.chemistry.inorganic#0'],
      [
        'From C-P18. Explore figure: { kind: "symmetryElements" } with scenes { symmetry: { molecule: "H2O", element: "C2" } } (types in typesHe4d.ts; element ids in reps/symmetryMath.ts: C2, C3, C4, Cinf, sv, sv2, sh, sd, i, S3, S4, S6, as each molecule has them). With no element the molecule alone, named with its point group.',
        'Cards for inorganic#0 (sort): { kind: "molecule", formula } for every card in the plan, e.g. "H2O", "CH2Cl2", "SO2", "NH3", "CHCl3", "PCl3", "BF3", "PCl5", "CH4", "CCl4", "XeF4", "[PtCl4]2-", "SF6", "[Fe(CN)6]4-", "CO2", "C2H2", "HCl", "HCN"; formulas drawn before keep their art.',
        'Checks: layoutFigures (picturesHe4d.ts symmetryFigureIssues) applies each scene’s element and requires every atom to land on a like atom; the element must belong to the molecule.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-symmetryElements',
      'g.he-symmetryElements-planes',
      'g.he-molecule-card-point-groups',
    ],
  },
  {
    ...ask(
      'HC115',
      'macromolecules',
      'macromolecules level: one polypeptide in four views two to a row (its sequence, its helix and sheet with the hydrogen bonds, its fold with a disulfide bond, two chains packed), the same residues in each keeping their colour; `level` 1–4 lights one view, the others faded',
      ['he.chemistry.biochemistry#0~levels', 'he.chemistry.biochemistry#0~dimensions'],
      [
        'From C-P21. New field on the calculator macromolecules spec (typesHs2e.ts MacroCalcSpec): level?: NumOrVar (1–4), with macro: "protein" and count the residues (up to 36 drawn, the count written). Pages without `level` draw the H100 chain as before.',
        '~levels is a sort today: its cards can stay text, or an explore page later can pass the same picture per scene. ~dimensions: { kind: "macromolecules", macro: "protein", count: "n", level: 2 } (18 residues, 2.70 nm, 5.0 turns as an α-helix).',
        'Checks (harness/picturesHe4d.ts proteinLevelIssues): level whole 1–4 on a protein; every view draws the same residues (each chain of the fourth).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-macromolecules-level', 'g.he-macromolecules-level-quaternary'],
  },
];
