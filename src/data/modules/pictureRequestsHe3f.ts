/**
 * College pictures, round 3, group F (docs/RENDERINGS_HE.md). Spread into
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

export const HE3F_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC56',
      'chemDiagram',
      'Cell options on chemDiagram mode cell: ion dots by concentration in each beaker, Q and E beside E° on a volt scale (a concentration cell with one metal both sides); electrolysis with a DC supply, electrons counted Q = It, n(e⁻) = Q ÷ F, n = n(e⁻) ÷ z, m = nM',
      [
        'he.chemistry.gen-chem-2#4',
        'he.chemistry.gen-chem-2#4~concentration-cell',
        'he.chemistry.gen-chem-2#4~electrolysis',
        'he.chemistry.analytical#4',
      ],
      [
        'From C-P9. A college cell spec has no cathode/anode potentials (the Grades 9–12 `cell` is unchanged).',
        'Concentrations: { kind: "chemDiagram", mode: "cell", metals: [anode, cathode] (symbols; one metal twice = concentration cell, E° = 0 unless `standard` is set), concentrations: { anode, cathode } (M), n, standard? (E°, V), T? (K, default 298.15), Q?, E?, ions?: ["Zn²⁺", "Cu²⁺"], R? (8.314), F? (96485) }.',
        'gen-chem-2#4 main: { metals: ["Zn", "Cu"], concentrations: { anode: "ca", cathode: "cc" }, n: "n", standard: "E0", T: "T", Q: "Q", E: "E" } (and ~free-energy-k may pass the same with its own ids). ~concentration-cell: { metals: ["Cu", "Cu"], concentrations: { anode: <dilute>, cathode: <concentrated> }, n: "n", E: "E" }.',
        'Electrolysis: { kind: "chemDiagram", mode: "cell", electrolysis: { current, time (s formula unit; shownIn min is fine), z, metal: "Cu", charge?, electrons?, moles?, molar? (g/mol), mass? (g), F? } }. ~electrolysis: { electrolysis: { current: "I", time: "t", z: "z", metal: "Cu", charge: "q", electrons: "ne", moles: "nm", molar: "M", mass: "m" } }; analytical#4 coulometry shares that page (a coulometry page there passes the same, without molar and mass for moles only).',
        'Checks (harness/picturesHe3f.ts): Q = [anode] ÷ [cathode]; E from Nernst; E° = 0 for one metal; the richer beaker holds the most dots; Q = It, n(e⁻) = Q ÷ F, moles = It ÷ zF, m = nM; z whole 1–6.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-chemDiagram-cell-nernst',
      'g.he-chemDiagram-cell-nernst-dilute',
      'g.he-chemDiagram-cell-concentration',
      'g.he-chemDiagram-cell-electrolysis',
      'g.he-chemDiagram-cell-electrolysis-silver',
    ],
  },
  {
    ...ask(
      'HC58',
      'equilibriumChart',
      'equilibriumChart mode gibbs: G against the extent from pure reactants to pure products, the minimum at the equilibrium extent K ÷ (1 + K), the current Q placed with its tangent (slope = ΔG); under it ΔG = ΔG° + RT ln Q against log Q, crossing zero at log K',
      [
        'he.chemistry.gen-chem-2#3',
        'he.chemistry.gen-chem-2#3~nonstandard',
        'he.chemistry.physical-1#2',
        'he.chemistry.biochemistry#3',
      ],
      [
        'From C-P23. Spec: { kind: "equilibriumChart", mode: "gibbs", gibbs: { standard (ΔG°; a kJ/mol variable is read × 1000, J/mol as is), T (K), K?, Q?, delta? (ΔG, same units as standard), R? (default 8.314) }, species?: [reactant, product] (default A, B) }. The curve is a model A ⇌ B with ideal mixing at the page’s ΔG° (the caption says so).',
        'gen-chem-2#3 main (in place of the interim table): { gibbs: { standard: "dG0", T: "T", K: "K" } }. ~nonstandard: { gibbs: { standard: "dG0", T: "T", Q: "Q", delta: "dG" } }. physical-1#2 links ~nonstandard (its own main stays the ln K–1/T line). biochemistry#3 main: { gibbs: { standard: "dG0", T: "T", Q: "Q", delta: "dG" }, species: ["ATP", "ADP + Pᵢ"] } (ΔG°′ −30.5, 310.15 K).',
        'Checks (harness/picturesHe3f.ts): K = e^(−ΔG° ÷ RT); the slope changes sign at Q = K and G is lowest there; the slope at Q has ΔG’s sign; ΔG = ΔG° + RT ln Q.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-equilibriumChart-gibbs-standard',
      'g.he-equilibriumChart-gibbs-nonstandard',
      'g.he-equilibriumChart-gibbs-near',
      'g.he-equilibriumChart-gibbs-atp',
    ],
  },
  {
    ...ask(
      'HC71',
      'phScale',
      'phScale titration options: a polyprotic acid (2 or 3 equivalence points, each half-way pH = pKₐ marked); a buffer on its Henderson–Hasselbalch curve (pKₐ ± 1 band, HA and A⁻ bars before and after); a free amino acid’s curve with the pI',
      [
        'he.chemistry.gen-chem-2#2~buffer',
        'he.chemistry.analytical#1~polyprotic',
        'he.chemistry.biochemistry#0',
      ],
      [
        'From C-P6. Polyprotic is an option on mode "titration": { kind: "phScale", mode: "titration", acid: { concentration, volume, name? }, base: { concentration, name? }, added, fixed?, polyprotic: { pKa: [pKa1, pKa2, pKa3?], equivalences?: [V1, V2, V3?], firstPH? } } (pKa replaces acid.Ka; the curve is the exact charge balance). analytical#1~polyprotic: { acid: { concentration: "ca", volume: "va" }, base: { concentration: "cb" }, added: "v1", fixed: true, polyprotic: { pKa: ["pk1", "pk2"], equivalences: ["v1", "v2"], firstPH: "ph1" } }. (The module test wants every value connected: the plan’s pKₐ and pH₁ form a group apart from the volumes, so the demo passes the acid’s pKₐ as numbers, pKa: [2.0, 6.0]; a page keeping both groups needs a relation joining them, or the pKₐ as numbers.)',
        'The buffer and amino acid have no titration volumes on their pages, so they are their own modes. gen-chem-2#2~buffer: { kind: "phScale", mode: "buffer", pKa: "pKa", acid: "na", base: "nb", added: "a" (mol strong acid, negative for base), before: "before", after: "after", names?: ["HA", "A⁻"] }. biochemistry#0: { kind: "phScale", mode: "aminoAcid", pKa1: "k1", pKa2: "k2", pKaR?: "kR", side: "none" | "acidic" | "basic" | a variable coded 0 none, 1 acidic, 2 basic, pH: "pH", charge: "q", pI: "pI", name? }.',
        'Checks (harness/picturesHe3f.ts): equivalence volumes k × CₐVₐ ÷ C_b (1 : 2 : 3); half-way pH = pKₐ within 0.05 for a weak, well-separated step; pH₁ = (pKₐ₁ + pKₐ₂) ÷ 2; the curve rises; buffer pH by Henderson–Hasselbalch before and after; pI between two pKₐ with charge 0 there, the half-way pH at each pKₐ, the charge at the pH.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-phScale-polyprotic',
      'g.he-phScale-polyprotic-triprotic',
      'g.he-phScale-buffer',
      'g.he-phScale-buffer-base',
      'g.he-phScale-amino-glycine',
      'g.he-phScale-amino-lysine',
    ],
  },
  {
    ...ask(
      'HC73',
      'phScale',
      'phScale mode pka: a vertical pKₐ ladder from −10 to 50 with named acids, the two acids of a reaction lit and the equilibrium arrow toward the weaker acid; log K = ΔpKₐ',
      [
        'he.chemistry.organic-1#0~pka-equilibrium',
        'he.chemistry.organic-1#0~acid-order',
        'he.chemistry.organic-2#3',
      ],
      [
        'From C-P22. Spec: { kind: "phScale", mode: "pka", acids?: [{ name, pKa }] (LADDER_ACIDS in typesHe3f.ts: HCl −7, H₃O⁺ −1.7, ethanoic acid 4.76, phenol 10, water 15.7, ethyne 25, ammonia 38, ethane 50), reaction?: { left: { name, pKa }, right: { name, pKa }, logK?, K? }, range?: [lo, hi] (default [−10, 50]) }. An acid of the reaction named like a listed one is drawn once, lit.',
        'organic-1#0~pka-equilibrium: { acids: LADDER_ACIDS, reaction: { left: { name: "ethanoic acid", pKa: "pl" }, right: { name: "water", pKa: "pr" }, logK: "logK", K: "K" } }.',
        '~acid-order and organic-2#3 are sequences: their stages take card figures, not pictures, so the ladder can stand there only as a calculator alternative or an intro picture the lesson chat adds (the ladder with their acids and no reaction draws as a reference; for organic-2#3 the conjugate acids’ pKₐ: dimethylammonium 10.7, ammonium 9.3, pyridinium 5.3, anilinium 4.6).',
        'Checks (harness/picturesHe3f.ts): every pKₐ on the ladder’s range; no acid named twice; log K = pKₐ(right) − pKₐ(left); K = 10^log K. The arrow points to the larger pKₐ by construction.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-phScale-pka-equilibrium', 'g.he-phScale-pka-reverse'],
  },
];
